import { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { Product } from "../../types";

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(cents / 100);
}

interface ProductFormData {
  name: string;
  description: string;
  price: string; // user enters dollars e.g. "85.00"
  category: string;
  image: string;
  sizes: string; // comma separated
  stock: string;
  featured: boolean;
}

const DEFAULT_FORM: ProductFormData = {
  name: "",
  description: "",
  price: "",
  category: "Men",
  image: "",
  sizes: "S, M, L, XL",
  stock: "50",
  featured: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit / Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Inline stock edit tracker
  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null);

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await api.adminProducts();
      setProducts(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleOpenCreate() {
    setEditingId(null);
    setFormData(DEFAULT_FORM);
    setFormError(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(p: Product) {
    setEditingId(p.id);
    setFormData({
      name: p.name,
      description: p.description,
      price: (p.price / 100).toFixed(2),
      category: p.category,
      image: p.image,
      sizes: p.sizes.join(", "),
      stock: String(p.stock),
      featured: p.featured,
    });
    setFormError(null);
    setIsModalOpen(true);
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      const priceCents = Math.round(parseFloat(formData.price) * 100);
      if (isNaN(priceCents) || priceCents < 0) {
        throw new Error("Enter a valid price in dollars (e.g. 75.00)");
      }

      const stockNum = parseInt(formData.stock, 10);
      if (isNaN(stockNum) || stockNum < 0) {
        throw new Error("Enter a valid stock number");
      }

      const parsedSizes = formData.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (editingId) {
        const updated = await api.adminUpdateProduct(editingId, {
          name: formData.name,
          description: formData.description,
          price: priceCents,
          category: formData.category,
          image: formData.image,
          sizes: parsedSizes,
          stock: stockNum,
          featured: formData.featured,
        });
        setProducts((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
      } else {
        const created = await api.adminCreateProduct({
          name: formData.name,
          description: formData.description,
          price: priceCents,
          category: formData.category,
          image: formData.image,
          sizes: parsedSizes,
          stock: stockNum,
          featured: formData.featured,
        });
        setProducts((prev) => [created, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Error saving product");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProduct(id: string, name: string) {
    if (!window.confirm(`Permanently delete "${name}" from the store?`)) return;
    try {
      await api.adminDeleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete product");
    }
  }

  async function handleQuickStockChange(id: string, delta: number) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    const newStock = Math.max(0, p.stock + delta);
    setUpdatingStockId(id);
    try {
      const updated = await api.adminUpdateProduct(id, { stock: newStock });
      setProducts((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update stock");
    } finally {
      setUpdatingStockId(null);
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-2xl font-display font-medium tracking-tight text-ink">Products & Inventory</h1>
          <p className="text-xs font-mono text-muted mt-1 uppercase tracking-wider">
            Live catalog control · pricing, stock adjustments & styling
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 text-xs font-mono uppercase bg-ink text-paper hover:bg-accent transition-colors rounded font-medium self-start sm:self-auto"
        >
          + Add New Product
        </button>
      </div>

      {error && (
        <div className="p-4 border border-red-500/40 bg-red-500/10 text-red-400 text-xs font-mono rounded">
          {error}
        </div>
      )}

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="p-8 text-center text-muted text-xs font-mono border border-line rounded bg-surface/20">
            Loading store products...
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-muted text-xs font-mono border border-line rounded bg-surface/20">
            No products found. Add your first item above.
          </div>
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              className="border border-line rounded bg-surface/20 p-4 space-y-3"
            >
              <div className="flex gap-3">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-14 h-16 object-cover rounded bg-surface border border-line shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-ink font-medium text-sm leading-snug">{p.name}</p>
                  <p className="text-[11px] text-muted font-mono mt-0.5">{p.category}</p>
                  <p className="text-ink font-medium text-sm font-mono mt-1">
                    {formatCents(p.price)}
                  </p>
                </div>
                {p.featured && (
                  <span className="h-fit text-emerald-400 text-[9px] uppercase border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
                    Featured
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                {/* Stock control */}
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono border ${
                      p.stock <= 5
                        ? "border-red-500/50 bg-red-500/10 text-red-400 font-semibold"
                        : "border-line bg-surface text-ink"
                    }`}
                  >
                    {p.stock} in stock
                  </span>
                  <button
                    disabled={updatingStockId === p.id || p.stock <= 0}
                    onClick={() => handleQuickStockChange(p.id, -1)}
                    className="w-6 h-6 rounded border border-line text-muted hover:text-ink hover:border-ink flex items-center justify-center transition-colors disabled:opacity-30"
                    title="Decrease stock by 1"
                  >
                    −
                  </button>
                  <button
                    disabled={updatingStockId === p.id}
                    onClick={() => handleQuickStockChange(p.id, 5)}
                    className="w-6 h-6 rounded border border-line text-muted hover:text-ink hover:border-ink flex items-center justify-center transition-colors disabled:opacity-30"
                    title="Restock +5"
                  >
                    +
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="px-3 py-1 text-[11px] uppercase border border-line text-muted hover:text-ink hover:border-ink rounded transition-colors font-mono"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id, p.name)}
                    className="px-3 py-1 text-[11px] uppercase border border-red-900/40 text-red-400 hover:border-red-600 rounded transition-colors font-mono"
                  >
                    Del
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Catalog Table (desktop) */}
      <div className="hidden md:block border border-line rounded overflow-hidden bg-surface/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-surface border-b border-line text-muted uppercase">
              <tr>
                <th className="p-3.5 pl-4">Item</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Stock Level</th>
                <th className="p-3.5">Sizes</th>
                <th className="p-3.5">Featured</th>
                <th className="p-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    Loading store products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    No products found in catalog. Add your first item above.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-surface/40 transition-colors">
                    <td className="p-3.5 pl-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-9 h-11 object-cover rounded bg-surface border border-line shrink-0"
                        />
                        <div>
                          <p className="text-ink font-medium leading-snug">{p.name}</p>
                          <p className="text-[11px] text-muted truncate max-w-xs">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-muted">{p.category}</td>
                    <td className="p-3.5 text-ink font-medium">{formatCents(p.price)}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono border ${
                            p.stock <= 5
                              ? "border-red-500/50 bg-red-500/10 text-red-400 font-semibold"
                              : "border-line bg-surface text-ink"
                          }`}
                        >
                          {p.stock} in stock
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            disabled={updatingStockId === p.id || p.stock <= 0}
                            onClick={() => handleQuickStockChange(p.id, -1)}
                            className="w-5 h-5 rounded border border-line text-muted hover:text-ink hover:border-ink flex items-center justify-center transition-colors disabled:opacity-30"
                            title="Decrease stock by 1"
                          >
                            -
                          </button>
                          <button
                            disabled={updatingStockId === p.id}
                            onClick={() => handleQuickStockChange(p.id, 5)}
                            className="w-5 h-5 rounded border border-line text-muted hover:text-ink hover:border-ink flex items-center justify-center transition-colors disabled:opacity-30"
                            title="Restock +5"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-muted text-[11px]">
                      {p.sizes.join(", ") || "—"}
                    </td>
                    <td className="p-3.5">
                      {p.featured ? (
                        <span className="text-emerald-400 text-[10px] uppercase border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          Yes
                        </span>
                      ) : (
                        <span className="text-muted text-[10px] uppercase">No</span>
                      )}
                    </td>
                    <td className="p-3.5 pr-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="px-2.5 py-1 text-[11px] uppercase border border-line text-muted hover:text-ink hover:border-ink rounded transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="px-2.5 py-1 text-[11px] uppercase border border-red-900/40 text-red-400 hover:border-red-600 rounded transition-colors"
                      >
                        Del
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over / Modal for Create & Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface border border-line w-full max-w-xl rounded shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h2 className="text-lg font-display font-medium text-ink">
                {editingId ? "Edit Product" : "Add Product to Catalog"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-ink text-sm font-mono"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 border border-red-500/40 bg-red-500/10 text-red-400 text-xs font-mono rounded">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-muted uppercase tracking-wider mb-1.5">
                  Product Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Heavyweight Raw Canvas Overshirt"
                  className="w-full px-3 py-2 bg-paper border border-line rounded text-ink focus:border-ink outline-none"
                />
              </div>

              <div>
                <label className="block text-muted uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Material specs, weave density, silhouette notes..."
                  className="w-full px-3 py-2 bg-paper border border-line rounded text-ink focus:border-ink outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted uppercase tracking-wider mb-1.5">
                    Price (PHP ₱)
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="1500.00"
                    className="w-full px-3 py-2 bg-paper border border-line rounded text-ink focus:border-ink outline-none"
                  />
                </div>

                <div>
                  <label className="block text-muted uppercase tracking-wider mb-1.5">
                    Stock Quantity
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="50"
                    className="w-full px-3 py-2 bg-paper border border-line rounded text-ink focus:border-ink outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-paper border border-line rounded text-ink focus:border-ink outline-none"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted uppercase tracking-wider mb-1.5">
                    Sizes (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="S, M, L, XL"
                    className="w-full px-3 py-2 bg-paper border border-line rounded text-ink focus:border-ink outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted uppercase tracking-wider mb-1.5">
                  Image URL
                </label>
                <input
                  required
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-paper border border-line rounded text-ink focus:border-ink outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-line bg-paper text-ink focus:ring-0"
                />
                <label htmlFor="featured-check" className="text-ink cursor-pointer select-none">
                  Display as Featured on Homepage
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-line rounded text-muted hover:text-ink uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  type="submit"
                  className="px-5 py-2 bg-ink text-paper rounded font-medium hover:bg-accent uppercase transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingId ? "Update Product" : "Publish Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
