import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { api } from "../api/client";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types";

const ALL = "All";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activeCategory = params.get("category") || ALL;
  const activeQ = params.get("q") || "";

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .products({
        category: activeCategory !== ALL ? activeCategory : undefined,
        q: activeQ || undefined,
      })
      .then(setProducts)
      .catch(() => setError("Couldn't load products. Is the API running?"))
      .finally(() => setLoading(false));
  }, [activeCategory, activeQ]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api.categories().then((cats) => setCategories([ALL, ...cats])).catch(() => {});
  }, []);

  function setCategory(cat: string) {
    const next = new URLSearchParams(params);
    if (cat === ALL) next.delete("category");
    else next.set("category", cat);
    setParams(next, { replace: true });
  }

  function clearSearch() {
    const next = new URLSearchParams(params);
    next.delete("q");
    setParams(next, { replace: true });
  }

  return (
    <div className="wrap pt-10 pb-20">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-tightest">
          {activeQ
            ? `Results for "${activeQ}"`
            : activeCategory === ALL
            ? "All pieces"
            : activeCategory}
        </h1>
        {products.length > 0 && !loading && (
          <p className="text-sm text-muted">{products.length} items</p>
        )}
      </div>

      {/* Active search query pill */}
      {activeQ && (
        <div className="mt-4 inline-flex items-center gap-2 border border-line px-3 py-1.5 text-sm">
          <span className="text-graphite">Search: {activeQ}</span>
          <button onClick={clearSearch} className="text-muted hover:text-ink" aria-label="Clear search">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Category filters */}
      {categories.length > 1 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <SlidersHorizontal size={15} className="text-muted" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 text-sm transition-colors ${
                activeCategory === cat
                  ? "border border-ink text-ink bg-surface"
                  : "border border-line text-muted hover:border-ink hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-line" />
                <div className="mt-3 h-4 w-3/4 bg-line" />
                <div className="mt-2 h-3 w-1/3 bg-line" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-muted">{error}</p>
            <button onClick={load} className="btn-outline mt-6">
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted">Nothing matched your search.</p>
            <button onClick={() => { clearSearch(); setCategory(ALL); }} className="btn-outline mt-6">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
