import { Link } from "react-router-dom";
import { Trash2, Plus, Minus } from "lucide-react";
import { useCart, selectSubtotal } from "../store/cart";
import ProductImage from "../components/ProductImage";
import { formatPrice } from "../lib/format";

export default function Cart() {
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const setQty = useCart((s) => s.setQty);
  const subtotal = useCart(selectSubtotal);

  if (items.length === 0) {
    return (
      <div className="wrap py-32 text-center">
        <p className="font-display text-3xl font-bold tracking-tightest">Your cart is empty</p>
        <p className="mt-3 text-muted">Add some pieces and come back.</p>
        <Link to="/shop" className="btn-primary mt-8 inline-flex">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="wrap pt-10 pb-20">
      <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-tightest">
        Your cart
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Line items */}
        <div className="space-y-0 divide-y divide-line">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}`}
              className="flex gap-5 py-6"
            >
              <Link to={`/product/${item.productId}`} className="shrink-0">
                <div className="h-28 w-20 overflow-hidden bg-surface sm:h-32 sm:w-24">
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      to={`/product/${item.productId}`}
                      className="font-medium leading-snug hover:text-accent transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-sm text-muted">Size: {item.size}</p>
                  </div>
                  <span className="shrink-0 tabular-nums text-[15px]">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Qty controls */}
                  <div className="flex items-center border border-line">
                    <button
                      onClick={() => setQty(item.productId, item.size, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center text-muted hover:text-ink transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-8 text-center text-sm tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => setQty(item.productId, item.size, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center text-muted hover:text-ink transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <button
                    onClick={() => remove(item.productId, item.size)}
                    className="text-muted hover:text-ink transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="border border-line p-6">
            <h2 className="font-display text-xl font-bold tracking-tight">Order summary</h2>

            <div className="mt-4 space-y-2 text-sm">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex justify-between text-muted">
                  <span>{item.name} × {item.quantity}</span>
                  <span className="tabular-nums">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between border-t border-line pt-4 font-medium">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-muted">Shipping calculated at checkout.</p>

            <Link to="/checkout" className="btn-primary mt-6 block w-full text-center">
              Proceed to checkout
            </Link>
            <Link
              to="/shop"
              className="mt-3 block text-center text-sm text-muted hover:text-ink transition-colors"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
