"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type UserRole = "admin" | "tenant" | "customer";
type AppRole = "admin" | "tennant" | "customer";
type AuthMode = "login" | "register";

const ROLE_DESTINATION: Record<AppRole, string> = {
  admin: "/admin/a_dashboard",
  tennant: "/tennant/t_dashboard",
  customer: "/customer/marketplace",
};

type RegisterForm = {
  user_type: UserRole;
  name: string;
  email: string;
  phone: string;
  password: string;
  // customer fields
  company: string;
  tax_id: string;
  billing_address: string;
  shipping_address: string;
  // tenant fields
  location: string;
  image_url: string;
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<UserRole>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const checkoutRequired = searchParams.get("reason") === "checkout-required";

  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    user_type: "customer",
    name: "",
    email: "",
    phone: "",
    password: "",
    company: "",
    tax_id: "",
    billing_address: "",
    shipping_address: "",
    location: "",
    image_url: "",
  });

  const canUseNext = useMemo(() => {
    const nextPath = searchParams.get("next") ?? "";
    return nextPath.startsWith("/") && !nextPath.startsWith("/login");
  }, [searchParams]);

  const nextPath = searchParams.get("next") ?? "";

  const redirectAfterLogin = (appRole: AppRole) => {
    const fallbackPath = ROLE_DESTINATION[appRole];
    router.push(canUseNext ? nextPath : fallbackPath);
    router.refresh();
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          user_type: role,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { role?: AppRole; error?: string };
      if (!res.ok || !data.role) {
        setError(data.error ?? "Login failed. Please check your credentials.");
        return;
      }

      redirectAfterLogin(data.role);
    } catch {
      setError("Unable to contact auth service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChange = (field: keyof RegisterForm, value: string) => {
    setRegisterForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const payload: Record<string, string> = {
      user_type: registerForm.user_type,
      name: registerForm.name,
      email: registerForm.email,
      phone: registerForm.phone,
      password: registerForm.password,
    };

    if (registerForm.user_type === "customer") {
      payload.company = registerForm.company;
      payload.tax_id = registerForm.tax_id;
      payload.billing_address = registerForm.billing_address;
      payload.shipping_address = registerForm.shipping_address;
    }

    if (registerForm.user_type === "tenant") {
      if (registerForm.location) payload.location = registerForm.location;
      if (registerForm.image_url) payload.image_url = registerForm.image_url;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) {
        setError(data.error ?? data.message ?? "Registration failed.");
        return;
      }

      setSuccess("Account created. Please log in with your new credentials.");
      setMode("login");
      setRole(registerForm.user_type);
      setEmail(registerForm.email);
      setPassword("");
    } catch {
      setError("Unable to contact auth service. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="w-full bg-white">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Account</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">{mode === "login" ? "Sign In" : "Create Account"}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {mode === "login"
              ? "Use your IAM credentials to access your dashboard."
              : "Register a new account in IAM, then sign in."}
          </p>

          <div className="mt-6 inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                mode === "login" ? "bg-white text-teal-700 shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
                setSuccess("");
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                mode === "register" ? "bg-white text-teal-700 shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Register
            </button>
          </div>

          {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {success ? <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}
          {checkoutRequired ? (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              To checkout, you must register or log in first.
            </p>
          ) : null}

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Role</span>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as UserRole)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-teal-500 focus:outline-none"
                >
                  <option value="customer">Customer</option>
                  <option value="tenant">Tenant</option>
                  <option value="admin">Admin</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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
          ) : (
            <form onSubmit={handleRegister} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Role</span>
                <select
                  value={registerForm.user_type}
                  onChange={(event) => handleRegisterChange("user_type", event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-teal-500 focus:outline-none"
                >
                  <option value="customer">Customer</option>
                  <option value="tenant">Tenant</option>
                  <option value="admin">Admin</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Name</span>
                <input
                  type="text"
                  required
                  value={registerForm.name}
                  onChange={(event) => handleRegisterChange("name", event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-teal-500 focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Email</span>
                <input
                  type="email"
                  required
                  value={registerForm.email}
                  onChange={(event) => handleRegisterChange("email", event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-teal-500 focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Phone</span>
                <input
                  type="text"
                  required
                  value={registerForm.phone}
                  onChange={(event) => handleRegisterChange("phone", event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-teal-500 focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Password</span>
                <input
                  type="password"
                  required
                  value={registerForm.password}
                  onChange={(event) => handleRegisterChange("password", event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-teal-500 focus:outline-none"
                />
              </label>

              {registerForm.user_type === "tenant" ? (
                <>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Location <span className="font-normal text-gray-400 normal-case">(optional)</span></span>
                    <input
                      type="text"
                      value={registerForm.location}
                      onChange={(event) => handleRegisterChange("location", event.target.value)}
                      placeholder="e.g. Jakarta, Indonesia"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-teal-500 focus:outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Shop Image URL <span className="font-normal text-gray-400 normal-case">(optional)</span></span>
                    <input
                      type="url"
                      value={registerForm.image_url}
                      onChange={(event) => handleRegisterChange("image_url", event.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-teal-500 focus:outline-none"
                    />
                  </label>
                </>
              ) : null}

              {registerForm.user_type === "customer" ? (
                <>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Company</span>
                    <input
                      type="text"
                      required
                      value={registerForm.company}
                      onChange={(event) => handleRegisterChange("company", event.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-teal-500 focus:outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Tax ID</span>
                    <input
                      type="text"
                      required
                      value={registerForm.tax_id}
                      onChange={(event) => handleRegisterChange("tax_id", event.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-teal-500 focus:outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Billing Address</span>
                    <input
                      type="text"
                      required
                      value={registerForm.billing_address}
                      onChange={(event) => handleRegisterChange("billing_address", event.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-teal-500 focus:outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Shipping Address</span>
                    <input
                      type="text"
                      required
                      value={registerForm.shipping_address}
                      onChange={(event) => handleRegisterChange("shipping_address", event.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-teal-500 focus:outline-none"
                    />
                  </label>
                </>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#01A49E] px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>
          )}

          <div className="mt-6 text-sm text-gray-600">
            <Link href="/home" className="font-semibold text-teal-700 hover:underline">Back to home</Link>
          </div>
        </div>
      </div>
    </main>
  );
}