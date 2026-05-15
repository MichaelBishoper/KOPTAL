import { NextRequest, NextResponse } from "next/server";
import { COOKIE_KEYS, normalizeRoleValue } from "@/lib/cookies/shared";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get("koptal_token")?.value;

  if (!token) {
    const response = NextResponse.json({ role: "guest", userId: null, name: null });

    // Clean up stale session cookies so anonymous users don't keep an old role.
    response.cookies.set(COOKIE_KEYS.role, "", { maxAge: 0, path: "/" });
    response.cookies.set(COOKIE_KEYS.userId, "", { maxAge: 0, path: "/" });
    response.cookies.set(COOKIE_KEYS.name, "", { maxAge: 0, path: "/" });

    return response;
  }

  const role = normalizeRoleValue(request.cookies.get(COOKIE_KEYS.role)?.value);
  const userIdRaw = request.cookies.get(COOKIE_KEYS.userId)?.value;
  const parsed = Number(userIdRaw);
  const userId = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  const name = request.cookies.get(COOKIE_KEYS.name)?.value ?? null;

  return NextResponse.json({ role, userId, name });
}
