import type { AdminRow, CustomerRow, TenantRow } from "@/structure/db";

export type EditableUserRow = AdminRow | CustomerRow | TenantRow;
export type UserLookupRole = "customer" | "tenant" | "admin";

const PROFILE_PATH: Record<UserLookupRole, string> = {
  customer: "/api/iam/customers/profile",
  tenant: "/api/iam/tenants/profile",
  admin: "/api/iam/admins/profile",
};

export async function saveUserProfileDraft<TUser extends EditableUserRow>(
  user: TUser,
  draft: Record<string, string>,
): Promise<TUser | null> {
  const role: UserLookupRole = "customer_id" in user ? "customer" : "tenant_id" in user ? "tenant" : "admin";

  try {
    const res = await fetch(PROFILE_PATH[role], {
      method: "PUT",
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(draft),
    });

    if (!res.ok) {
      return null;
    }

    const updated = (await res.json()) as TUser;
    Object.assign(user, updated);
    return user;
  } catch {
    return null;
  }
}

export async function getUserByRoleAndId(role: UserLookupRole, _userId: number): Promise<EditableUserRow | null> {
  try {
    const res = await fetch(PROFILE_PATH[role], {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as EditableUserRow;
  } catch {
    return null;
  }
}
