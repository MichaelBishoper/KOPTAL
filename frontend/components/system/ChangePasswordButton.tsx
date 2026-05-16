"use client";

import { useState } from "react";

export default function ChangePasswordButton() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/iam/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to change password');
      setSuccess('Password updated');
      setOpen(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Change Password
        </button>
      ) : (
        <div className="p-4 rounded-lg border bg-white">
          <div className="space-y-2">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded border px-2 py-1"
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded border px-2 py-1"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-gray-200 px-3 py-1 text-sm text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={loading}
                className="rounded-lg bg-[#01A49E] px-3 py-1 text-sm text-white"
              >
                {loading ? 'Changing...' : 'Change'}
              </button>
            </div>
            {error ? <p className="text-rose-600 text-sm">{error}</p> : null}
            {success ? <p className="text-teal-700 text-sm">{success}</p> : null}
          </div>
        </div>
      )}
    </div>
  );
}
