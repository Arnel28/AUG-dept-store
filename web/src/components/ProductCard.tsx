import { Link } from "react-router-dom";
import ProductImage from "./ProductImage";
import { formatPrice } from "../lib/format";
import type { Product } from "../types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transform-none"
        />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="font-sans text-[15px] font-medium leading-snug">
          {product.name}
        </h3>
        <span className="shrink-0 text-[15px] tabular-nums text-graphite">
          {formatPrice(product.price)}
        </span>
      </div>
      <p className="mt-0.5 text-[13px] text-muted">{product.category}</p>
    </Link>
  );
}
