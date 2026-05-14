import type { NextRequest } from "next/server";
import { AppRole, COOKIE_KEYS, normalizeRoleValue } from "./shared";

export function getRoleFromRequestCookies(request: NextRequest): AppRole {
  return normalizeRoleValue(request.cookies.get(COOKIE_KEYS.role)?.value);
}
