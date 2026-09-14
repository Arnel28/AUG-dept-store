import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Check } from "lucide-react";
import { api } from "../api/client";
import { useCart } from "../store/cart";
import ProductImage from "../components/ProductImage";
import { formatPrice } from "../lib/format";
import type { Product } from "../types";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [size, setSize] = useState("");
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const addToCart = useCart((s) => s.add);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .product(id)
      .then((p) => { setProduct(p); setSize(""); })
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false));
  }, [id]);

  function handleAdd() {
    if (!product) return;
    if (!size) { setSizeError(true); return; }
    setSizeError(false);
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  if (loading) {
    return (
      <div className="wrap pt-10 pb-20">
        <div className="grid animate-pulse gap-10 lg:grid-cols-2">
          <div className="aspect-[4/5] bg-line" />
          <div className="space-y-4 pt-6">
            <div className="h-6 w-2/3 bg-line" />
            <div className="h-10 w-1/2 bg-line" />
            <div className="h-4 w-full bg-line" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="wrap py-32 text-center">
        <p className="text-muted">{error || "Product not found."}</p>
        <Link to="/shop" className="btn-outline mt-6">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="wrap pt-6 pb-20">
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors mb-8">
        <ArrowLeft size={15} /> Back
      </Link>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Image */}
        <div className="aspect-[4/5] overflow-hidden bg-surface">
          <ProductImage
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex flex-col pt-2">
          <p className="text-sm text-muted">{product.category}</p>
          <h1 className="mt-2 font-display text-[clamp(1.8rem,4vw,3rem)] font-bold leading-[1.05] tracking-tightest">
            {product.name}
          </h1>
          <p className="mt-4 font-display text-2xl font-semibold">
            {formatPrice(product.price)}
          </p>

          <p className="mt-6 text-[15px] leading-relaxed text-graphite max-w-prose">
            {product.description}
          </p>

          {/* Size picker */}
          {product.sizes[0] !== "One Size" && (
            <div className="mt-8">
              <p className={`mb-3 text-sm font-medium ${sizeError ? "text-red-600" : ""}`}>
                {sizeError ? "Please select a size" : "Select size"}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSize(s); setSizeError(false); }}
                    className={`min-w-[3rem] border px-3 py-2 text-sm transition-colors ${
                      size === s
                        ? "border-ink bg-ink text-white"
                        : sizeError
                        ? "border-red-400 hover:border-ink"
                        : "border-line hover:border-ink"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* One Size */}
          {product.sizes[0] === "One Size" && (
            <p className="mt-8 text-sm text-muted">One size</p>
          )}

          {/* Add to cart */}
          <button
            onClick={handleAdd}
            className={`btn mt-8 w-full justify-center gap-3 text-base transition-colors ${
              added ? "bg-accent text-white" : "bg-ink text-white hover:bg-accent"
            }`}
          >
            {added ? (
              <>
                <Check size={18} /> Added to cart
              </>
            ) : (
              <>
                <ShoppingBag size={18} /> Add to cart
              </>
            )}
          </button>

          {/* Metadata */}
          <div className="mt-10 space-y-3 border-t border-line pt-6 text-sm text-muted">
            <p>Free shipping on orders over ₱2,500</p>
            <p>30-day returns on unworn items</p>
          </div>
        </div>
      </div>
    </div>
  );
}
