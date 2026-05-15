import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { normalizeRoleValue } from "@/lib/cookies/shared";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("koptal_token")?.value;
  const role = token ? normalizeRoleValue(cookieStore.get("koptal_role")?.value) : "guest";

  if (role !== "admin") {
    redirect("/login");
  }

  return children;
}
