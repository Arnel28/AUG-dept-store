import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, User, Search, Menu, X } from "lucide-react";
import { useCart, selectCount } from "../store/cart";
import { useAuth } from "../store/auth";

const navLinks = [
  { label: "Shop all", to: "/shop" },
  { label: "Men", to: "/shop?category=Men" },
  { label: "Women", to: "/shop?category=Women" },
  { label: "Accessories", to: "/shop?category=Accessories" },
];

export default function Navbar() {
  const count = useCart(selectCount);
  const user = useAuth((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    setSearchOpen(false);
    setQ("");
    navigate(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
      <div className="wrap grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Left: menu button (mobile) + nav (desktop) */}
        <div className="flex items-center gap-7 justify-self-start">
          <button
            className="btn-ghost -ml-3 lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <nav className="hidden items-center gap-7 text-sm lg:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="ul text-graphite transition-colors hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center: wordmark */}
        <Link
          to="/"
          className="justify-self-center font-display text-[22px] font-extrabold leading-none tracking-[0.08em] uppercase"
        >
          AUG DEPT.
        </Link>

        {/* Right: actions */}
        <div className="flex items-center gap-0.5 justify-self-end sm:gap-1">
          <button
            className="btn-ghost"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
          >
            <Search size={19} />
          </button>
          {user?.isAdmin && (
            <Link
              to="/admin"
              className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-surface border border-line text-ink hover:border-ink transition-colors mr-1"
            >
              Admin
            </Link>
          )}
          <Link
            to={user ? "/account" : "/login"}
            className="btn-ghost"
            aria-label={user ? "Your account" : "Sign in"}
          >
            <User size={19} />
          </Link>
          <Link to="/cart" className="btn-ghost relative" aria-label="Cart">
            <ShoppingBag size={19} />
            {count > 0 && (
              <span className="absolute right-0 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold tabular-nums text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Slide-down search */}
      {searchOpen && (
        <div className="border-t border-line bg-paper">
          <form onSubmit={submitSearch} className="wrap flex items-center gap-3 py-3">
            <Search size={18} className="shrink-0 text-muted" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for pieces…"
              className="w-full bg-transparent py-1 text-[15px] outline-none placeholder:text-muted"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="shrink-0 text-muted hover:text-ink"
              aria-label="Close search"
            >
              <X size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/30 animate-fade"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-72 max-w-[82%] flex-col bg-paper p-6">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-extrabold tracking-[0.08em] uppercase">
                AUG DEPT.
              </span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X size={22} />
              </button>
            </div>
            <nav className="mt-10 flex flex-col">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-line py-3.5 text-lg"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <Link
              to={user ? "/account" : "/login"}
              onClick={() => setMenuOpen(false)}
              className="mt-auto py-2 text-graphite"
            >
              {user ? `Account — ${user.name}` : "Sign in"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
