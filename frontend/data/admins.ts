import type { AdminRow } from "@/structure/db";

export const admins: AdminRow[] = [
  {
    manager_id: 1,
    name: "System Admin",
    email: "admin@example.com",
    phone: "+62-800-0000-0000",
    categories: ["Vegetables", "Fruits", "Herbs", "Grains"],
    password_hash: "",
    created_at: "2026-01-01T00:00:00.000Z",
  },
];
