import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../store/auth";

// Guards a route: waits for session hydration, then redirects to /login
// (remembering where the user was headed) if there's no signed-in user.
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = useAuth((s) => s.user);
  const ready = useAuth((s) => s.ready);
  const location = useLocation();

  if (!ready) {
    return (
      <div className="wrap py-32 text-center text-muted">Loading…</div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
