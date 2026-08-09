import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/admin/auth.service";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setIsError(false);
      await authService.login(email, password);
      navigate("/");
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <div className="flex-1 flex flex-col p-8">
        <div className="flex items-center gap-3 mb-auto">
          <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm">
            GC
          </div>
          <span className="text-lg font-semibold">GoCourier Admin</span>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
            <p className="text-[var(--text-muted)] text-sm">
              Sign in with your admin credentials to manage GoCourier.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gocourier.com"
                className="admin-input"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="admin-input pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" className="admin-btn admin-btn-primary w-full" disabled={isLoading}>
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
            {isError && (
              <p className="text-red-400 text-xs">Invalid credentials or not an admin account.</p>
            )}
          </form>
        </div>

        <div className="mt-auto pt-8 text-sm text-[var(--text-muted)]">
          Copyright © {new Date().getFullYear()} GoCourier
        </div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center p-16 relative overflow-hidden bg-gradient-to-br from-[#13125a] via-[#08162a] to-[#1d36d8]">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,#60a5fa,transparent_40%),radial-gradient(circle_at_70%_80%,#2563eb,transparent_45%)]" />
        <div className="relative z-10 text-center max-w-sm">
          <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 mx-auto mb-6 flex items-center justify-center text-3xl font-bold">
            GC
          </div>
          <h2 className="text-3xl font-bold mb-3">GoCourier Admin</h2>
          <p className="text-blue-100/80 text-sm">
            Control campuses, catalogs, batches, orders, and revenue from one dark console.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
