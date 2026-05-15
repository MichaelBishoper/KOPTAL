import type { AdminRow, CustomerRow, TenantRow } from "@/structure/db";
const BASE = "/api/iam";

export type UserRole = "customer" | "tenant" | "admin";
export type EditableUserRow = AdminRow | CustomerRow | TenantRow;

function profilePath(role: UserRole): string {
  return `/${role}s/profile`;
}

export async function fetchUserProfileFromAPI(role: UserRole): Promise<EditableUserRow | null> {
  try {
    const res = await fetch(`${BASE}${profilePath(role)}`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[fetch/users] fetchUserProfileFromAPI failed:", err);
    return null;
  }
}

export async function updateUserProfileOnAPI(
  role: UserRole,
  draft: Record<string, string>,
): Promise<EditableUserRow | null> {
  try {
    const res = await fetch(`${BASE}${profilePath(role)}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(draft),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[fetch/users] updateUserProfileOnAPI failed:", err);
    return null;
  }
}
