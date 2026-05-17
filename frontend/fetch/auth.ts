import type { AppRole } from "@/lib/cookies/shared";
import api from "@/lib/axios";

export type AuthSession = {
  role: AppRole;
  userId: number | null;
  name: string | null;
};

export async function fetchAuthSessionFromAPI(): Promise<AuthSession> {
  try {
    const res = await api.get<AuthSession>("/api/auth/session");
    return res.data;
  } catch {
    return { role: "guest", userId: null, name: null };
  }
}
