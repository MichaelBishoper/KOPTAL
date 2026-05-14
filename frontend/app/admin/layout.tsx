import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { normalizeRoleValue } from "@/lib/cookies/shared";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const role = normalizeRoleValue(cookieStore.get("koptal_role")?.value);

  if (role !== "admin") {
    redirect("/login");
  }

  return children;
}
