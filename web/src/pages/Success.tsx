import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { api } from "../api/client";
import { formatPrice, formatDate } from "../lib/format";
import type { Order } from "../types";

export default function Success() {
  const [params] = useSearchParams();
  const orderId = params.get("order");
  const sessionId = params.get("session_id");
  const isDemo = params.get("demo") === "1";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }

    async function confirm() {
      try {
        // If this is a Stripe redirect, confirm payment and get the order.
        if (sessionId && !isDemo) {
          const res = await api.confirm(sessionId);
          if (res.order) { setOrder(res.order); return; }
        }
        // Demo or fallback: fetch the order directly by id.
        const o = await api.order(orderId!);
        setOrder(o);
      } catch {
        setError("We couldn't retrieve your order details, but your order was placed.");
      } finally {
        setLoading(false);
      }
    }

    confirm();
  }, [orderId, sessionId, isDemo]);

  if (loading) {
    return (
      <div className="wrap py-32 flex justify-center">
        <Loader2 size={28} className="animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="wrap pt-16 pb-24 max-w-[700px]">
      <div className="flex items-start gap-4">
        <CheckCircle2 size={36} className="mt-1 shrink-0 text-accent" />
        <div>
          <h1 className="font-display text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-tightest leading-tight">
            Order confirmed
          </h1>
          <p className="mt-2 text-muted">
            Thank you{order ? `, ${order.shippingName.split(" ")[0]}` : ""}! We'll send a confirmation to{" "}
            {order?.email || "your email"}.
          </p>
        </div>
      </div>

      {error && <p className="mt-6 text-sm text-muted">{error}</p>}

      {order && (
        <div className="mt-10 border border-line p-6 space-y-6">
          <div className="flex flex-wrap gap-8 text-sm">
            <div>
              <p className="font-medium">Order reference</p>
              <p className="mt-1 text-muted font-mono text-xs">{order.id}</p>
            </div>
            <div>
              <p className="font-medium">Date</p>
              <p className="mt-1 text-muted">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="font-medium">Total</p>
              <p className="mt-1 text-muted">{formatPrice(order.total)}</p>
            </div>
            <div>
              <p className="font-medium">Status</p>
              <p className="mt-1 capitalize text-muted">{order.status}</p>
            </div>
          </div>

          <div className="border-t border-line pt-5">
            <p className="font-medium text-sm mb-3">Items</p>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-graphite">
                    {item.name} <span className="text-muted">({item.size}) × {item.quantity}</span>
                  </span>
                  <span className="tabular-nums text-muted">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-line pt-5 text-sm">
            <p className="font-medium mb-1">Shipping to</p>
            <p className="text-muted leading-relaxed">
              {order.shippingName}<br />
              {order.shippingAddress}, {order.shippingCity} {order.shippingZip}<br />
              {order.shippingCountry}
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-4">
        <Link to="/shop" className="btn-primary">Continue shopping</Link>
        <Link to="/account" className="btn-outline">View order history</Link>
      </div>
    </div>
  );
}
