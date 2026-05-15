import { fetchAuthSessionFromAPI, type AuthSession } from "@/fetch/auth";

export async function getAuthSession(): Promise<AuthSession> {
  return fetchAuthSessionFromAPI();
}
