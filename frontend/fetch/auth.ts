import type { AppRole } from "@/lib/cookies/shared";

export type AuthSession = {
  role: AppRole;
  userId: number | null;
  name: string | null;
};

export async function fetchAuthSessionFromAPI(): Promise<AuthSession> {
  try {
    const res = await fetch("/api/auth/session", {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      return { role: "guest", userId: null, name: null };
    }

    return (await res.json()) as AuthSession;
  } catch {
    return { role: "guest", userId: null, name: null };
  }
}
