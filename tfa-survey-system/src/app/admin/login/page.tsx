"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(160deg, #0a1628 0%, #1a3a6b 100%)" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #c8a84b, #e8c96b)" }}
          >
            TFA
          </div>
          <h1 className="text-white text-xl font-bold">Admin Dashboard</h1>
          <p className="text-blue-300 text-sm mt-1">لوحة إدارة الأكاديمية المالية</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-slate-800 font-semibold text-base mb-6">Sign in to continue</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="admin@tfa.sa"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-60 mt-2"
              style={{ background: "linear-gradient(135deg, #0a1628, #1a3a6b)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            TFA Training Landscape Study — Admin Access Only
          </p>
        </div>
      </div>
    </div>
  );
}
