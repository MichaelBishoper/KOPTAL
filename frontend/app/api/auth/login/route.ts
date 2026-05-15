import { NextRequest, NextResponse } from "next/server";

const IAM_URL = process.env.IAM_URL ?? process.env.NEXT_PUBLIC_IAM_URL ?? "http://localhost:3001";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password || !body?.user_type) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  let iamData: { token: string; user_type: string } | null = null;
  try {
    const res = await fetch(`${IAM_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        user_type: body.user_type,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err.message ?? "Invalid credentials" }, { status: res.status });
    }
    iamData = await res.json();
  } catch {
    return NextResponse.json({ error: "Auth service unavailable" }, { status: 503 });
  }

  if (!iamData) {
    return NextResponse.json({ error: "Unexpected auth response" }, { status: 500 });
  }

  const role = iamData.user_type === "tenant" ? "tennant" : iamData.user_type;
  const response = NextResponse.json({ role });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  };

  response.cookies.set("koptal_role", role, cookieOptions);
  response.cookies.set("koptal_token", iamData.token, cookieOptions);

  return response;
}
