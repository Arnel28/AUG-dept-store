import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="wrap py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-xl font-extrabold tracking-[0.08em] uppercase">
              AUG DEPT.
            </p>
            <p className="mt-3 max-w-[22ch] text-sm leading-relaxed text-muted">
              Minimalist streetwear. Clean cuts, honest materials.
            </p>
          </div>
          <div>
            <p className="mb-4 font-medium">Shop</p>
            <ul className="space-y-2 text-sm text-muted">
              {["Men", "Women", "Accessories"].map((c) => (
                <li key={c}>
                  <Link to={`/shop?category=${c}`} className="ul hover:text-ink">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-4 font-medium">Account</p>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link to="/login" className="ul hover:text-ink">
                  Sign in
                </Link>
              </li>
              <li>
                <Link to="/register" className="ul hover:text-ink">
                  Create account
                </Link>
              </li>
              <li>
                <Link to="/account" className="ul hover:text-ink">
                  Order history
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-4 font-medium">Info</p>
            <ul className="space-y-2 text-sm text-muted">
              <li>Free shipping over ₱2,500</li>
              <li>30-day returns</li>
              <li>hello@augdept.com</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} AUG DEPT. All rights reserved.</p>
          <p>Payments secured by Stripe.</p>
        </div>
      </div>
    </footer>
  );
}
