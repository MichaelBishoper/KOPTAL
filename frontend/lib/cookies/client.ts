import { AppRole, COOKIE_KEYS, normalizeRoleValue } from "./shared";

export function readCookieLatest(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .filter((entry) => entry.startsWith(`${name}=`))
    .pop();

  if (!cookie) return null;
  const value = cookie.split("=")[1]?.trim();
  return value ? decodeURIComponent(value) : null;
}

export function readAuthSessionFromCookies(): { role: AppRole; userId: number | null } {
  const role = normalizeRoleValue(readCookieLatest(COOKIE_KEYS.role));
  const userIdRaw = readCookieLatest(COOKIE_KEYS.userId);
  const parsed = Number(userIdRaw);
  const userId = Number.isFinite(parsed) && parsed > 0 ? parsed : null;

  return { role, userId };
}

export function readAuthTokenFromCookies(): string {
  return readCookieLatest(COOKIE_KEYS.token) ?? "";
}
