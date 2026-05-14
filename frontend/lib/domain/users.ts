import type { AdminRow, CustomerRow, TenantRow } from "@/structure/db";
import { getAdmins } from "./admins";
import { getCustomers } from "./customers";
import { getTenants } from "./tenants";

// API migration scaffold (users/profile):
// 1) Replace `getUserByRoleAndId` lookups with GET `/api/users/:role/:id`.
// 2) Replace `saveUserProfileDraft` local merge with PATCH `/api/users/:role/:id`.
// 3) Keep function signatures stable so components do not need changes.

export type EditableUserRow = AdminRow | CustomerRow | TenantRow;
export type UserLookupRole = "customer" | "tenant" | "admin";

// Keep a narrow allow-list so UI draft fields cannot overwrite immutable identity fields.
const EDITABLE_FIELDS = new Set([
  "name",
  "email",
  "phone",
  "company",
  "billing_address",
  "shipping_address",
  "location",
  "image",
]);

export function saveUserProfileDraft<TUser extends EditableUserRow>(
  user: TUser,
  draft: Record<string, string>,
): TUser {
  const nextValues: Record<string, string> = {};

  for (const [key, value] of Object.entries(draft)) {
    if (EDITABLE_FIELDS.has(key)) {
      nextValues[key] = value;
    }
  }

  Object.assign(user, nextValues);
  return user;
}

export function getUserByRoleAndId(role: UserLookupRole, userId: number): EditableUserRow | null {
  if (role === "customer") {
    return getCustomers().find((entry) => entry.customer_id === userId) ?? null;
  }

  if (role === "tenant") {
    return getTenants().find((entry) => entry.tenant_id === userId) ?? null;
  }

  return getAdmins().find((entry) => entry.manager_id === userId) ?? null;
}
