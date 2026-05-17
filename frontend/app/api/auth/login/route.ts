import { NextRequest, NextResponse } from "next/server";

const IAM_URL = process.env.IAM_URL ?? process.env.NEXT_PUBLIC_IAM_URL ?? "http://localhost:3001";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type LoginRequest = {
  email?: string;
  username?: string;
  password?: string;
  user_type?: "customer" | "tenant" | "admin";
};

function decodeUserIdFromJwt(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8")) as {
      user_id?: number;
    };
    const userId = Number(payload.user_id);
    return Number.isFinite(userId) && userId > 0 ? userId : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json().catch(() => null)) as LoginRequest | null;

  if (!body?.password || !body?.user_type) {
    return NextResponse.json({ error: "Missing login credentials" }, { status: 400 });
  }
  
  if (body.user_type === "admin" && !body.username) {
    return NextResponse.json({ error: "Missing login credentials (username)" }, { status: 400 });
  }

  if (body.user_type !== "admin" && !body.email) {
    return NextResponse.json({ error: "Missing login credentials (email)" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const upstream = await fetch(`${IAM_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = (await upstream.json().catch(() => ({}))) as {
      token?: string;
      user_type?: string;
      name?: string;
      error?: string;
      message?: string;
    };

    if (!upstream.ok || !data.token || !data.user_type) {
      return NextResponse.json(
        { error: data.error ?? data.message ?? "Invalid credentials" },
        { status: upstream.status || 401 },
      );
    }

    const appRole = data.user_type === "tenant" ? "tennant" : data.user_type;
    const userId = decodeUserIdFromJwt(data.token);

    const response = NextResponse.json({ role: appRole, userId, name: data.name ?? null });

    if (data.name) {
      response.cookies.set("koptal_name", data.name, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      });
    }

    response.cookies.set("koptal_role", appRole, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    if (userId) {
      response.cookies.set("koptal_user_id", String(userId), {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      });
    }

    response.cookies.set("koptal_token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Auth service unavailable" }, { status: 503 });
  }
}
