import { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { AdminOrder } from "../../types";

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(cents / 100);
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await api.adminOrders();
      setOrders(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    try {
      const updated = await api.adminUpdateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  }

  function toggleExpand(orderId: string) {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-line pb-6">
        <h1 className="text-2xl font-display font-medium tracking-tight text-ink">Sales & Orders</h1>
        <p className="text-xs font-mono text-muted mt-1 uppercase tracking-wider">
          Transaction history · customer info · fulfillment status
        </p>
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
            Loading order logs...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-muted text-xs font-mono border border-line rounded bg-surface/20">
            No orders recorded in the system yet.
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="border border-line rounded bg-surface/20 p-4 space-y-3 font-mono"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-ink font-medium text-sm">#{order.id.slice(-8)}</p>
                  <p className="text-[11px] text-muted mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-ink font-medium text-sm shrink-0">
                  {formatCents(order.total)}
                </p>
              </div>

              <div className="text-[11px]">
                <p className="text-ink">
                  {order.shippingName || order.user?.name || "Customer"}
                </p>
                <p className="text-muted">{order.email}</p>
                <p className="text-muted/70">
                  {order.shippingCity || "—"}, {order.shippingCountry || "—"} ·{" "}
                  {order.items?.length || 0} unit(s)
                </p>
              </div>

              <div className="flex items-center justify-between gap-2">
                <select
                  disabled={updatingId === order.id}
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className={`text-[11px] font-mono uppercase px-2 py-1.5 rounded border outline-none bg-paper cursor-pointer transition-colors ${
                    order.status === "paid" || order.status === "complete"
                      ? "border-emerald-500/50 text-emerald-400"
                      : order.status === "shipped"
                      ? "border-blue-500/50 text-blue-400"
                      : order.status === "pending"
                      ? "border-amber-500/50 text-amber-400"
                      : "border-line text-muted"
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="shipped">Shipped</option>
                  <option value="complete">Complete</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="text-[11px] uppercase border border-line px-3 py-1.5 rounded text-muted hover:text-ink hover:border-ink transition-colors"
                >
                  {expandedOrderId === order.id ? "Hide" : "Inspect"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Orders Table (desktop) */}
      <div className="hidden md:block border border-line rounded overflow-hidden bg-surface/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-surface border-b border-line text-muted uppercase">
              <tr>
                <th className="p-3.5 pl-4">Order Ref</th>
                <th className="p-3.5">Customer & Destination</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5">Settlement Total</th>
                <th className="p-3.5">Fulfillment Status</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 pr-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    Loading order logs...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    No orders recorded in the system yet.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-surface/30 transition-colors group"
                    >
                      <td className="p-3.5 pl-4 align-top font-medium text-ink">
                        #{order.id.slice(-8)}
                      </td>
                      <td className="p-3.5 align-top">
                        <div className="text-ink font-medium">
                          {order.shippingName || order.user?.name || "Customer"}
                        </div>
                        <div className="text-muted text-[11px]">{order.email}</div>
                        <div className="text-muted/70 text-[10px] mt-0.5">
                          {order.shippingCity || "—"}, {order.shippingCountry || "—"}
                        </div>
                      </td>
                      <td className="p-3.5 align-top text-muted">
                        {order.items?.length || 0} unit(s)
                      </td>
                      <td className="p-3.5 align-top text-ink font-medium">
                        {formatCents(order.total)}
                      </td>
                      <td className="p-3.5 align-top">
                        <select
                          disabled={updatingId === order.id}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-[11px] font-mono uppercase px-2 py-1 rounded border outline-none bg-paper cursor-pointer transition-colors ${
                            order.status === "paid" || order.status === "complete"
                              ? "border-emerald-500/50 text-emerald-400"
                              : order.status === "shipped"
                              ? "border-blue-500/50 text-blue-400"
                              : order.status === "pending"
                              ? "border-amber-500/50 text-amber-400"
                              : "border-line text-muted"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="shipped">Shipped</option>
                          <option value="complete">Complete</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-3.5 align-top text-muted">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 pr-4 align-top text-right">
                        <button
                          onClick={() => toggleExpand(order.id)}
                          className="text-[11px] uppercase border border-line px-2.5 py-1 rounded text-muted hover:text-ink hover:border-ink transition-colors"
                        >
                          {isExpanded ? "Hide" : "Inspect"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expanded Order Inspector Card */}
      {expandedOrderId && (() => {
        const order = orders.find((o) => o.id === expandedOrderId);
        if (!order) return null;
        return (
          <div className="p-6 bg-surface/50 border border-line rounded space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h2 className="text-base font-display font-medium text-ink">
                  Order Details — #{order.id}
                </h2>
                <p className="text-[11px] font-mono text-muted uppercase mt-0.5">
                  Placed {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setExpandedOrderId(null)}
                className="text-muted hover:text-ink text-xs font-mono"
              >
                Close Inspector ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              {/* Shipping Address */}
              <div className="space-y-2 p-4 bg-paper/60 border border-line rounded">
                <p className="text-muted uppercase tracking-wider font-semibold">Shipping Destination</p>
                <div className="text-ink leading-relaxed">
                  <p className="font-medium">{order.shippingName || "N/A"}</p>
                  <p>{order.shippingAddress || "No address provided"}</p>
                  <p>
                    {order.shippingCity} {order.shippingZip}
                  </p>
                  <p>{order.shippingCountry}</p>
                  <p className="text-muted text-[11px] mt-2">Contact: {order.email}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-2 p-4 bg-paper/60 border border-line rounded">
                <p className="text-muted uppercase tracking-wider font-semibold">Payment / Session</p>
                <div className="text-ink leading-relaxed space-y-1">
                  <p>
                    <span className="text-muted">Total Paid:</span> {formatCents(order.total)}
                  </p>
                  <p>
                    <span className="text-muted">Status:</span>{" "}
                    <span className="uppercase text-emerald-400 font-medium">{order.status}</span>
                  </p>
                  {order.stripeSessionId && (
                    <p className="truncate text-muted text-[11px]">
                      <span className="text-muted/70">Stripe ID:</span> {order.stripeSessionId}
                    </p>
                  )}
                  {order.user && (
                    <p className="text-muted text-[11px]">
                      <span className="text-muted/70">Registered Account:</span> {order.user.name} ({order.user.email})
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Line items list */}
            <div className="space-y-2">
              <p className="text-xs font-mono uppercase tracking-wider text-muted font-semibold">
                Purchased Articles ({order.items?.length || 0})
              </p>
              <div className="border border-line rounded overflow-hidden bg-paper/40">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-line bg-surface/50 text-muted uppercase">
                    <tr>
                      <th className="p-3 pl-4">Product Name</th>
                      <th className="p-3">Selected Size</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3 pr-4 text-right">Unit Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {order.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="p-3 pl-4 text-ink font-medium">{item.name}</td>
                        <td className="p-3 text-muted">{item.size || "Standard"}</td>
                        <td className="p-3 text-muted">{item.quantity}</td>
                        <td className="p-3 pr-4 text-right text-ink">{formatCents(item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
