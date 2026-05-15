import type { AdminRow, CustomerRow, TenantRow } from "@/structure/db";
import { fetchUserProfileFromAPI, updateUserProfileOnAPI } from "@/fetch/users";

export type EditableUserRow = AdminRow | CustomerRow | TenantRow;
export type UserLookupRole = "customer" | "tenant" | "admin";

export async function saveUserProfileDraft(
  user: EditableUserRow,
  draft: Record<string, string>,
): Promise<EditableUserRow | null> {
  const role = "customer_id" in user ? "customer" : "tenant_id" in user ? "tenant" : "admin";
  return updateUserProfileOnAPI(role, draft);
}

export async function getUserByRoleAndId(role: UserLookupRole, _userId: number): Promise<EditableUserRow | null> {
  return fetchUserProfileFromAPI(role);
}
