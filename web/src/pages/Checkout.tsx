import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart, selectSubtotal } from "../store/cart";
import { useAuth } from "../store/auth";
import { api } from "../api/client";
import { formatPrice } from "../lib/format";
import { Loader2 } from "lucide-react";

interface ShippingForm {
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

const EMPTY: ShippingForm = {
  name: "",
  email: "",
  address: "",
  city: "",
  zip: "",
  country: "United States",
};

export default function Checkout() {
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clear);
  const subtotal = useCart(selectSubtotal);
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();

  const [form, setForm] = useState<ShippingForm>({
    ...EMPTY,
    email: user?.email || "",
    name: user?.name || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    return (
      <div className="wrap py-32 text-center">
        <p className="text-muted">Your cart is empty.</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">Shop now</Link>
      </div>
    );
  }

  function field(key: keyof ShippingForm, label: string, placeholder = "", type = "text") {
    return (
      <div>
        <label className="label">{label}</label>
        <input
          type={type}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          placeholder={placeholder}
          className="field"
          required
        />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await api.checkout({
        items: items.map((i) => ({
          productId: i.productId,
          size: i.size,
          quantity: i.quantity,
        })),
        shipping: form,
      });

      if (result.mode === "stripe" && result.url) {
        clearCart();
        window.location.href = result.url;
      } else if (result.mode === "demo") {
        clearCart();
        navigate(`/success?order=${result.orderId}&demo=1`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap pt-10 pb-20">
      <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-tightest">
        Checkout
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Shipping form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="font-display text-xl font-bold tracking-tight">Shipping details</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            {field("name", "Full name", "Jane Smith")}
            {field("email", "Email address", "jane@example.com", "email")}
          </div>
          {field("address", "Street address", "123 Main St")}
          <div className="grid gap-5 sm:grid-cols-3">
            {field("city", "City", "New York")}
            {field("zip", "ZIP / Postal code", "10001")}
            {field("country", "Country", "United States")}
          </div>

          {error && (
            <p className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center text-base"
          >
            {loading ? (
              <>
                <Loader2 size={17} className="animate-spin" /> Processing…
              </>
            ) : (
              `Pay ${formatPrice(subtotal)}`
            )}
          </button>

          <p className="text-center text-xs text-muted">
            Payments secured by Stripe. Your card details never touch our server.
          </p>
        </form>

        {/* Order summary */}
        <div className="h-fit border border-line p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-xl font-bold tracking-tight">Your order</h2>
          <div className="mt-4 divide-y divide-line">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex justify-between gap-3 py-3 text-sm"
              >
                <span className="text-graphite">
                  {item.name} <span className="text-muted">({item.size}) × {item.quantity}</span>
                </span>
                <span className="shrink-0 tabular-nums">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-line pt-3 font-medium">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
