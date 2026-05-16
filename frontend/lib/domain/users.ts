import type { AdminRow, CustomerRow, TenantRow } from "@/structure/db";
import { upsertTenantCache } from "./tenants";

export type EditableUserRow = AdminRow | CustomerRow | TenantRow;
export type UserLookupRole = "customer" | "tenant" | "admin";

const PROFILE_PATH: Record<UserLookupRole, string> = {
  customer: "/api/iam/customers/profile",
  tenant: "/api/iam/tenants/profile",
  admin: "/api/iam/admins/profile",
};

function buildProfileSavePayload(user: EditableUserRow, draft: Record<string, string>): Record<string, string> {
  if ("tenant_id" in user) {
    return {
      name: draft.name ?? user.name ?? "",
      email: draft.email ?? user.email ?? "",
      phone: draft.phone ?? user.phone ?? "",
      national_id_number: draft.national_id_number ?? user.national_id_number ?? "",
      location: draft.location ?? user.location ?? "",
      image: draft.image ?? user.image ?? "",
    };
  }

  if ("customer_id" in user) {
    return {
      name: draft.name ?? user.name ?? "",
      email: draft.email ?? user.email ?? "",
      phone: draft.phone ?? user.phone ?? "",
      company: draft.company ?? user.company ?? "",
      business_id_number: draft.business_id_number ?? user.business_id_number ?? "",
      corporate_tax_id: draft.corporate_tax_id ?? user.corporate_tax_id ?? "",
      billing_address: draft.billing_address ?? user.billing_address ?? "",
      shipping_address: draft.shipping_address ?? user.shipping_address ?? "",
      ...(draft.image ? { image: draft.image } : {}),
    };
  }

  return {
    name: draft.name ?? user.name ?? "",
    email: draft.email ?? user.email ?? "",
    phone: draft.phone ?? user.phone ?? "",
    cooperative_id_number: draft.cooperative_id_number ?? user.cooperative_id_number ?? "",
    ...(draft.image ? { image: draft.image } : {}),
  };
}

export async function saveUserProfileDraft<TUser extends EditableUserRow>(
  user: TUser,
  draft: Record<string, string>,
  roleHint?: UserLookupRole,
): Promise<TUser | null> {
  const role: UserLookupRole =
    roleHint ?? ("customer_id" in user ? "customer" : "tenant_id" in user ? "tenant" : "admin");
  const payload = buildProfileSavePayload(user, draft);

  const parseUpdatedUser = async (res: Response): Promise<TUser> => {
    const data = (await res.json()) as TUser | { success?: boolean; data?: TUser };
    if (typeof data === "object" && data !== null && "data" in data && data.data) {
      return data.data;
    }
    return data as TUser;
  };

  try {
    const res = await fetch(PROFILE_PATH[role], {
      method: "PUT",
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const updated = await parseUpdatedUser(res);
      Object.assign(user, updated);
      if (payload.image) {
        const normalizedUser = user as Record<string, unknown>;
        if (typeof normalizedUser.image !== "string" || !normalizedUser.image) {
          normalizedUser.image = payload.image;
        }
        if (typeof normalizedUser.image_url !== "string" || !normalizedUser.image_url) {
          normalizedUser.image_url = payload.image;
        }
      }
      if (role === "tenant") {
        upsertTenantCache(user as TenantRow);
      }
      return user;
    }

    if (role === "tenant" && "tenant_id" in user) {
      const fallbackRes = await fetch(`/api/iam/tenants/${user.tenant_id}`, {
        method: "PUT",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (fallbackRes.ok) {
        const updated = await parseUpdatedUser(fallbackRes);
        Object.assign(user, updated);
        if (payload.image) {
          const normalizedUser = user as Record<string, unknown>;
          if (typeof normalizedUser.image !== "string" || !normalizedUser.image) {
            normalizedUser.image = payload.image;
          }
          if (typeof normalizedUser.image_url !== "string" || !normalizedUser.image_url) {
            normalizedUser.image_url = payload.image;
          }
        }
        upsertTenantCache(user as TenantRow);
        return user;
      }
    }

    return null;
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
