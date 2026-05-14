import { AppRole, COOKIE_KEYS, normalizeRoleValue } from "./shared";

type CookieWriteOptions = {
  maxAge?: number;
  path?: string;
  sameSite?: "lax" | "strict" | "none";
};

const DEFAULT_COOKIE_OPTIONS: Required<CookieWriteOptions> = {
  maxAge: 60 * 60 * 24 * 30,
  path: "/",
  sameSite: "lax",
};

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

export function writeCookie(name: string, value: string, options: CookieWriteOptions = {}): void {
  if (typeof document === "undefined") return;

  const opts = { ...DEFAULT_COOKIE_OPTIONS, ...options };
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=${opts.path}; max-age=${opts.maxAge}; samesite=${opts.sameSite}${secure}`;
}

export function clearCookie(name: string): void {
  writeCookie(name, "", { maxAge: 0 });
}

export function readAuthSessionFromCookies(): { role: AppRole; userId: number | null } {
  const role = normalizeRoleValue(readCookieLatest(COOKIE_KEYS.role));
  const userIdRaw = readCookieLatest(COOKIE_KEYS.userId);
  const parsed = Number(userIdRaw);
  const userId = Number.isFinite(parsed) && parsed > 0 ? parsed : null;

  return { role, userId };
}

export function writeAuthCookies(role: Exclude<AppRole, "guest">, userId: number): void {
  writeCookie(COOKIE_KEYS.role, role);
  writeCookie(COOKIE_KEYS.userId, String(userId));
}

export function clearAuthCookies(): void {
  clearCookie(COOKIE_KEYS.role);
  clearCookie(COOKIE_KEYS.userId);
}
