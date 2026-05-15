import { NextRequest, NextResponse } from "next/server";

// Dev-only role switcher — disabled in production.
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const role: string = body?.role ?? "guest";
  const userId: string = String(body?.userId ?? 1);

  const response = NextResponse.json({ role });
  const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  };

  response.cookies.set("koptal_role", role, cookieOptions);
  response.cookies.set("koptal_user_id", userId, cookieOptions);

  return response;
}
