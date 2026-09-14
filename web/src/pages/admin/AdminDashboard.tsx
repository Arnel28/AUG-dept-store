import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { AdminStats, AdminOrder } from "../../types";

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(cents / 100);
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [statsData, ordersData] = await Promise.all([
          api.adminStats(),
          api.adminOrders(),
        ]);
        setStats(statsData);
        setRecentOrders(ordersData.slice(0, 5));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-muted font-mono text-sm">Loading telemetry & store stats...</div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="p-4 border border-red-500/40 bg-red-500/10 text-red-400 text-sm font-mono rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-2xl font-display font-medium tracking-tight text-ink">Store Overview</h1>
          <p className="text-xs font-mono text-muted mt-1 uppercase tracking-wider">
            Real-time shop telemetry · sales & stock state
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2 text-xs font-mono uppercase bg-surface border border-line text-ink hover:border-ink transition-colors rounded"
          >
            Manage Catalog
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2 text-xs font-mono uppercase bg-ink text-paper hover:bg-accent transition-colors rounded font-medium"
          >
            Review Orders
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="p-5 bg-surface/50 border border-line rounded">
          <p className="text-xs font-mono uppercase tracking-wider text-muted">Total Revenue</p>
          <p className="mt-2 text-3xl font-display font-medium text-ink tracking-tight">
            {formatCents(stats?.totalRevenue || 0)}
          </p>
          <p className="text-[11px] font-mono text-muted mt-2">Captured settlements</p>
        </div>

        {/* Total Orders */}
        <div className="p-5 bg-surface/50 border border-line rounded">
          <p className="text-xs font-mono uppercase tracking-wider text-muted">Total Orders</p>
          <p className="mt-2 text-3xl font-display font-medium text-ink tracking-tight">
            {stats?.totalOrders || 0}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-mono text-muted">
              {stats?.pendingOrders || 0} pending fulfillment
            </span>
          </div>
        </div>

        {/* Catalog Items */}
        <div className="p-5 bg-surface/50 border border-line rounded">
          <p className="text-xs font-mono uppercase tracking-wider text-muted">Catalog Products</p>
          <p className="mt-2 text-3xl font-display font-medium text-ink tracking-tight">
            {stats?.totalProducts || 0}
          </p>
          <p className="text-[11px] font-mono text-muted mt-2">Active articles</p>
        </div>

        {/* Low Stock Alert */}
        <div
          className={`p-5 rounded border ${
            (stats?.lowStockCount || 0) > 0
              ? "bg-red-950/20 border-red-900/50"
              : "bg-surface/50 border-line"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono uppercase tracking-wider text-muted">Low Stock Alert</p>
            {(stats?.lowStockCount || 0) > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>
          <p
            className={`mt-2 text-3xl font-display font-medium tracking-tight ${
              (stats?.lowStockCount || 0) > 0 ? "text-red-400" : "text-ink"
            }`}
          >
            {stats?.lowStockCount || 0}
          </p>
          <p className="text-[11px] font-mono text-muted mt-2">Items with ≤ 5 units left</p>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono uppercase tracking-wider text-ink font-medium">
            Recent Transactions
          </h2>
          <Link
            to="/admin/orders"
            className="text-xs font-mono text-muted hover:text-ink transition-colors uppercase"
          >
            View all ({stats?.totalOrders || 0}) →
          </Link>
        </div>

        <div className="border border-line rounded overflow-hidden bg-surface/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface border-b border-line text-muted uppercase">
                <tr>
                  <th className="p-3.5 pl-4">Order ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5">Total</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-4 text-right">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted">
                      No customer orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface/40 transition-colors">
                      <td className="p-3.5 pl-4 text-ink font-medium">#{order.id.slice(-8)}</td>
                      <td className="p-3.5 text-muted">
                        <div>{order.shippingName || order.user?.name || "Guest"}</div>
                        <div className="text-[11px] text-muted/70">{order.email}</div>
                      </td>
                      <td className="p-3.5 text-muted">{order.items?.length || 0} units</td>
                      <td className="p-3.5 text-ink font-medium">{formatCents(order.total)}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] uppercase rounded border ${
                            order.status === "paid" || order.status === "complete"
                              ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                              : order.status === "shipped"
                              ? "border-blue-500/40 text-blue-400 bg-blue-500/10"
                              : order.status === "pending"
                              ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                              : "border-line text-muted bg-surface"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3.5 pr-4 text-right text-muted">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
