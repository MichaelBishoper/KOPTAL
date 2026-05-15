"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type LoginRole = "admin" | "tennant" | "customer";

const ROLE_DESTINATION: Record<LoginRole, string> = {
  admin: "/admin/a_dashboard",
  tennant: "/tennant/t_dashboard",
  customer: "/customer/marketplace",
};

export default function LoginPage() {
  const router = useRouter();

  const handleRolePick = async (role: LoginRole) => {
    await fetch("/api/auth/dev-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, userId: 1 }),
    });

    const nextPath = new URLSearchParams(window.location.search).get("next") ?? "";
    const fallbackPath = ROLE_DESTINATION[role];
    const canUseNext = nextPath.startsWith("/") && !nextPath.startsWith("/login");

    router.push(canUseNext ? nextPath : fallbackPath);
  };

  return (
    <main className="w-full bg-white">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Barebones Login</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Choose User Role</h1>
          <p className="mt-2 text-sm text-gray-600">
            This is a temporary role switcher for frontend testing only. Real auth and security will be implemented later.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => handleRolePick("customer")}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:border-teal-500 hover:text-teal-700"
            >
              Continue as Customer
            </button>

            <button
              type="button"
              onClick={() => handleRolePick("tennant")}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:border-teal-500 hover:text-teal-700"
            >
              Continue as Tennant
            </button>

            <button
              type="button"
              onClick={() => handleRolePick("admin")}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:border-teal-500 hover:text-teal-700"
            >
              Continue as Admin
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <Link href="/home" className="font-semibold text-teal-700 hover:underline">Back to home</Link>
          </div>
        </div>
      </div>
    </main>
  );
}