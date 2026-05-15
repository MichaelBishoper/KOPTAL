import type { NextRequest } from "next/server";
import { AppRole, COOKIE_KEYS, normalizeRoleValue } from "./shared";

export function getRoleFromRequestCookies(request: NextRequest): AppRole {
  const token = request.cookies.get("koptal_token")?.value;
  if (!token) return "guest";
  return normalizeRoleValue(request.cookies.get(COOKIE_KEYS.role)?.value);
}
