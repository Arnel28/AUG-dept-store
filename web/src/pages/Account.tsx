import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../store/auth";
import { api } from "../api/client";
import { formatPrice, formatDate } from "../lib/format";
import { LogOut, Package } from "lucide-react";
import type { Order } from "../types";

export default function Account() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .orders()
      .then(setOrders)
      .catch(() => setError("Couldn't load orders."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="wrap pt-10 pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-tightest">
            {user?.name}
          </h1>
          <p className="mt-1 text-muted">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="btn-ghost flex items-center gap-2 text-sm text-muted hover:text-ink"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>

      {/* Orders */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold tracking-tight">Order history</h2>

        {loading ? (
          <div className="mt-6 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse border border-line p-5">
                <div className="h-4 w-1/4 bg-line" />
                <div className="mt-3 h-3 w-1/3 bg-line" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="mt-6 text-sm text-muted">{error}</p>
        ) : orders.length === 0 ? (
          <div className="mt-8 text-center">
            <Package size={40} className="mx-auto text-line" />
            <p className="mt-4 text-muted">You haven't placed any orders yet.</p>
            <Link to="/shop" className="btn-primary mt-6 inline-flex">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-line p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <p className="font-medium">{formatDate(order.createdAt)}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted">{order.id}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="tabular-nums font-medium">{formatPrice(order.total)}</span>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium ${
                        order.status === "paid"
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  {order.items.map((item) => (
                    <p key={item.id} className="text-sm text-muted">
                      {item.name} ({item.size}) × {item.quantity} — {formatPrice(item.price * item.quantity)}
                    </p>
                  ))}
                </div>

                <p className="mt-3 text-sm text-muted">
                  Shipped to {order.shippingName}, {order.shippingCity}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
