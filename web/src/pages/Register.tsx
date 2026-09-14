import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { Loader2 } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const register = useAuth((s) => s.register);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/account", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl font-bold tracking-tightest">Create an account</h1>
        <p className="mt-2 text-sm text-muted">
          Already have one?{" "}
          <Link to="/login" className="ul text-ink hover:text-accent">
            Sign in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="label">Your name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field"
              required
              autoComplete="name"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label">Password (6+ characters)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? <Loader2 size={17} className="animate-spin" /> : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
