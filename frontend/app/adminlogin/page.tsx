"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, Suspense } from "react";

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canUseNext = useMemo(() => {
    const nextPath = searchParams.get("next") ?? "";
    if (nextPath.startsWith("/admin")) return true;
    return false;
  }, [searchParams]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_type: "admin",
          username: username,
          password: password,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string; role?: string };

      if (!res.ok) {
        setError(data.error ?? data.message ?? "Invalid credentials.");
        return;
      }

      router.replace(canUseNext ? (searchParams.get("next") as string) : "/admin/a_dashboard");
    } catch {
      setError("Unable to contact auth service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Admin Portal</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Sign In</h1>
        <p className="mt-2 text-sm text-gray-600">Enter your administrator credentials to access the dashboard.</p>

        {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Username</span>
            <input
              type="text"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-teal-500 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-teal-500 focus:outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#01A49E] px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
      <Suspense>
        <AdminLoginContent />
      </Suspense>
    </main>
  );
}