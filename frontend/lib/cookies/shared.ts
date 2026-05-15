export type AppRole = "guest" | "customer" | "tennant" | "admin";
export type UserRole = "guest" | "customer" | "tenant" | "admin";

export const COOKIE_KEYS = {
  role: "koptal_role",
  userId: "koptal_user_id",
  token: "koptal_token",
} as const;

export function normalizeRoleValue(value: string | null | undefined): AppRole {
  if (!value) return "guest";
  const role = value.toLowerCase();
  if (role === "tenant" || role === "tennant") return "tennant";
  if (role === "admin" || role === "customer") return role;
  return "guest";
}

export function mapAppRoleToUserRole(role: AppRole): UserRole {
  if (role === "tennant") return "tenant";
  return role;
}
