import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { api } from "../api/client";
import ProductCard from "../components/ProductCard";
import ProductImage from "../components/ProductImage";
import type { Product } from "../types";

const HERO_IMG =
  "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=1800&h=1100&fit=crop&crop=top&q=85&auto=format";

const categories = [
  {
    label: "Men",
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&h=1100&fit=crop&q=80&auto=format",
  },
  {
    label: "Women",
    img: "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=900&h=1100&fit=crop&q=80&auto=format",
  },
  {
    label: "Accessories",
    img: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=900&h=1100&fit=crop&q=80&auto=format",
  },
];

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    api.products({ featured: true }).then(setFeatured).catch(() => {});
  }, []);

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative h-[88svh] min-h-[520px] overflow-hidden bg-ink">
        <img
          src={HERO_IMG}
          alt="AUG DEPT. — Minimalist streetwear"
          className="absolute inset-0 h-full w-full object-cover object-top opacity-80 animate-fade"
        />

        {/* editorial text block — bottom-left, large display type */}
        <div className="absolute inset-x-0 bottom-0 px-5 pb-12 sm:px-8 lg:px-12">
          <div className="animate-rise" style={{ animationDelay: "0.2s" }}>
            <h1 className="font-display text-[clamp(2.8rem,8vw,6.5rem)] font-extrabold leading-[0.92] tracking-tightest text-white">
              Clean cuts.<br />Minimal noise.<br />AUG DEPT.
            </h1>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link to="/shop" className="btn border border-white text-white hover:bg-white hover:text-ink transition-colors">
                Shop the collection
              </Link>
              <Link
                to="/shop?category=Men"
                className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                Men <ArrowRight size={15} />
              </Link>
              <Link
                to="/shop?category=Women"
                className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                Women <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Category grid ────────────────────────────────────── */}
      <section className="wrap pt-16">
        <h2 className="font-display text-[clamp(1.4rem,3vw,2rem)] font-bold tracking-tightest">
          Shop by category
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              to={`/shop?category=${cat.label}`}
              className="group relative aspect-[3/4] overflow-hidden bg-surface"
            >
              <ProductImage
                src={cat.img}
                alt={cat.label}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transform-none"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 to-transparent p-5">
                <span className="font-display text-2xl font-bold text-white">
                  {cat.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Featured products ────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="wrap pt-16">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-[clamp(1.4rem,3vw,2rem)] font-bold tracking-tightest">
              Featured pieces
            </h2>
            <Link to="/shop" className="flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {featured.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Brand strip ──────────────────────────────────────── */}
      <section className="wrap mt-20 border-t border-line pt-12 pb-4">
        <div className="grid gap-8 text-center sm:grid-cols-3">
          {[
            ["Free shipping", "On orders over ₱2,500"],
            ["30-day returns", "No questions asked"],
            ["Honest materials", "Natural fibres, traced sources"],
          ].map(([title, sub]) => (
            <div key={title}>
              <p className="font-display text-xl font-semibold tracking-tight">{title}</p>
              <p className="mt-1 text-sm text-muted">{sub}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
