import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../../store/auth";

export default function AdminLayout() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  const navLinks = [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/products", label: "Products & Stock", end: false },
    { to: "/admin/orders", label: "Sales & Orders", end: false },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col md:flex-row antialiased selection:bg-black selection:text-white">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-line bg-surface/40 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-line flex items-center justify-between">
            <div>
              <Link
                to="/"
                className="font-display font-semibold text-lg tracking-[0.12em] uppercase text-ink hover:text-white transition-colors"
              >
                AUG DEPT.
              </Link>
              <span className="block text-[10px] tracking-widest text-muted uppercase mt-0.5 font-mono">
                Admin Console
              </span>
            </div>
            <Link
              to="/"
              className="text-xs text-muted hover:text-ink transition-colors border border-line px-2 py-1 rounded"
              title="Return to store"
            >
              Shop ↗
            </Link>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2.5 text-xs font-mono tracking-wider uppercase transition-colors rounded ${
                    isActive
                      ? "bg-surface border border-line text-ink font-medium shadow-sm"
                      : "text-muted hover:text-ink hover:bg-surface/50"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer info & logout */}
        <div className="p-4 border-t border-line bg-surface/20">
          <div className="flex items-center justify-between">
            <div className="truncate mr-2">
              <p className="text-xs font-medium text-ink truncate">{user?.name || "Admin"}</p>
              <p className="text-[11px] text-muted font-mono truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="text-[11px] font-mono text-muted hover:text-ink uppercase border border-line px-2 py-1 rounded transition-colors"
            >
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
