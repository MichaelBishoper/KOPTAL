"use client";

import { useState } from "react";

export function CreateAdminForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error" | ""; message: string }>({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  // Helper to get token from cookies
  const getToken = () => {
    const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
    if (match) return decodeURIComponent(match[2]);
    return "";
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const token = getToken();
      if (!token) {
        setStatus({ type: "error", message: "Not authenticated. Token missing." });
        return;
      }

      const res = await fetch("/api/auth/register-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus({ type: "error", message: data.error || data.message || "Failed to create admin." });
        return;
      }

      setStatus({ type: "success", message: "Admin created successfully." });
      setUsername("");
      setPassword("");
    } catch (err) {
      setStatus({ type: "error", message: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-stone-900">Create New Admin</h2>
      <p className="mt-1 text-sm text-stone-600">Securely create another administrator account.</p>

      {status.message && (
        <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${status.type === 'success' ? 'border-teal-200 bg-teal-50 text-teal-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleCreateAdmin} className="mt-6 space-y-4 max-w-md">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-600">Username</span>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
            placeholder="New admin username"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-600">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
            placeholder="Secure password"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create Admin"}
        </button>
      </form>
    </div>
  );
}
