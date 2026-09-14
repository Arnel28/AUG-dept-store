import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../store/auth";

export default function AdminRoute({ children }: { children: ReactNode }) {
  const user = useAuth((s) => s.user);
  const ready = useAuth((s) => s.ready);
  const location = useLocation();

  if (!ready) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center text-muted font-mono text-sm">
        Authenticating...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
