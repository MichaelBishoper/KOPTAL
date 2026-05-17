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
  // admin fields
  cooperative_id_number: string;
  // customer fields
  company: string;
  business_id_number: string;
  corporate_tax_id: string;
  billing_address: string;
  shipping_address: string;
  // tenant fields
  national_id_number: string;
  location: string;
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
    cooperative_id_number: "",
    company: "",
    business_id_number: "",
    corporate_tax_id: "",
    billing_address: "",
    shipping_address: "",
    national_id_number: "",
    location: "",
  });

  const canUseNext = useMemo(() => {
    const nextPath = searchParams.get("next") ?? "";
    return nextPath.startsWith("/") && !nextPath.startsWith("/login");
  }, [searchParams]);

  const nextPath = searchParams.get("next") ?? "";

  const redirectAfterLogin = (appRole: AppRole) => {
    const fallbackPath = ROLE_DESTINATION[appRole];
    const shouldUseNext = checkoutRequired && canUseNext;
    router.push(shouldUseNext ? nextPath : fallbackPath);
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (registerForm.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
    if (!phoneRegex.test(registerForm.phone)) {
      setError("Please enter a valid Indonesian phone number (e.g., 08123456789 or +628123456789).");
      setLoading(false);
      return;
    }

    const payload: Record<string, string> = {
      user_type: registerForm.user_type,
      name: registerForm.name,
      email: registerForm.email,
      phone: registerForm.phone,
      password: registerForm.password,
    };

    if (registerForm.user_type === "admin") {
      if (!registerForm.cooperative_id_number.trim() || registerForm.cooperative_id_number.trim().length < 5) {
        setError("Cooperative ID Number (Nomor Induk Koperasi) must be at least 5 characters long.");
        setLoading(false);
        return;
      }
      payload.cooperative_id_number = registerForm.cooperative_id_number.trim();
    }

    if (registerForm.user_type === "customer") {
      if (!registerForm.business_id_number.trim() || registerForm.business_id_number.trim().length < 13) {
        setError("Business ID Number (Nomor Induk Berusaha) must be at least 13 digits.");
        setLoading(false);
        return;
      }
      if (!/^[\d\.\-]+$/.test(registerForm.corporate_tax_id) || registerForm.corporate_tax_id.length < 15) {
        setError("Corporate Tax ID (NPWP Badan) is invalid.");
        setLoading(false);
        return;
      }

      payload.company = registerForm.company;
      payload.business_id_number = registerForm.business_id_number;
      payload.corporate_tax_id = registerForm.corporate_tax_id;
      payload.billing_address = registerForm.billing_address;
      payload.shipping_address = registerForm.shipping_address;
    }

    if (registerForm.user_type === "tenant") {
      if (!registerForm.national_id_number.trim() || registerForm.national_id_number.trim().length < 16) {
        setError("National ID Number (Nomor Induk Kependudukan) must be at least 16 digits.");
        setLoading(false);
        return;
      }
      if (!registerForm.location.trim()) {
        setError("Location is required for tenant registration.");
        setLoading(false);
        return;
      }

      payload.national_id_number = registerForm.national_id_number.trim();
      payload.location = registerForm.location.trim();
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
                  placeholder="Your full name"
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
                  placeholder="Valid email address"
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
                  placeholder="Indonesian format (e.g. 0812...)"
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
                  placeholder="At least 8 characters long"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-teal-500 focus:outline-none"
                />
              </label>

              {registerForm.user_type === "tenant" ? (
                <>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">National ID Number (Nomor Induk Kependudukan)</span>
                    <input
                      type="text"
                      required
                      value={registerForm.national_id_number}
                      onChange={(event) => handleRegisterChange("national_id_number", event.target.value)}
                      placeholder="At least 16 digits"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-teal-500 focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Location</span>
                    <input
                      type="text"
                      required
                      value={registerForm.location}
                      onChange={(event) => handleRegisterChange("location", event.target.value)}
                      placeholder="e.g. Jakarta, Indonesia"
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
                      placeholder="Registered company name"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-teal-500 focus:outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Business ID Number (Nomor Induk Berusaha)</span>
                    <input
                      type="text"
                      required
                      value={registerForm.business_id_number}
                      onChange={(event) => handleRegisterChange("business_id_number", event.target.value)}
                      placeholder="At least 13 digits NIB"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-teal-500 focus:outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Corporate Tax ID (NPWP Badan)</span>
                    <input
                      type="text"
                      required
                      value={registerForm.corporate_tax_id}
                      onChange={(event) => handleRegisterChange("corporate_tax_id", event.target.value)}
                      placeholder="01.234.567.8-901.234"
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
                      placeholder="Complete billing address"
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
                      placeholder="Complete shipping address"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-teal-500 focus:outline-none"
                    />
                  </label>
                </>
              ) : null}

              {registerForm.user_type === "admin" ? (
                <>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Cooperative ID Number (Nomor Induk Koperasi)</span>
                    <input
                      type="text"
                      required
                      value={registerForm.cooperative_id_number}
                      onChange={(event) => handleRegisterChange("cooperative_id_number", event.target.value)}
                      placeholder="At least 5 characters"
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