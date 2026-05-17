import { NextRequest, NextResponse } from "next/server";

const IAM_URL = process.env.IAM_URL ?? process.env.NEXT_PUBLIC_IAM_URL ?? "http://localhost:3001";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid registration payload" }, { status: 400 });
  }

  // Get token from Authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const upstream = await fetch(`${IAM_URL}/api/auth/register-admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return NextResponse.json(
        { error: (data as { error?: string; message?: string }).error ?? (data as { message?: string }).message ?? "Registration failed" },
        { status: upstream.status || 400 },
      );
    }

    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    return NextResponse.json({ error: "Auth service unavailable" }, { status: 503 });
  }
}
