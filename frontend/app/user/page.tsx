"use client";

import { UserProfile } from "@/components/system/UserProfile";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserByRoleAndId, mapAppRoleToUserRole, readAuthSessionFromCookies } from "@/lib";
import type { AdminRow, CustomerRow, TenantRow } from "@/structure/db";

type UserType = "customer" | "tenant" | "admin" | "guest";
type UserRecord = AdminRow | CustomerRow | TenantRow;

export default function UserPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>("guest");
  const [userData, setUserData] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = readAuthSessionFromCookies();
    const role: UserType = mapAppRoleToUserRole(session.role);
    const userId = session.userId;

    if (role === "guest" || userId === null) {
      router.replace("/login?next=/user");
      setLoading(false);
      return;
    }

    setUserType(role);
    void loadUserData(role, userId);
  }, [router]);

  const loadUserData = async (role: Exclude<UserType, "guest">, userId: number) => {
    try {
      const user = await getUserByRoleAndId(role, userId) as UserRecord | null;

      if (!user) {
        router.replace("/login?next=/user");
        return;
      }

      setUserData(user);
    } catch (error) {
      console.error("Failed to load user data:", error);
      router.replace("/login?next=/user");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600 mt-2">View and manage your account information</p>
        </div>

        {/* User Profile */}
        <UserProfile user={userData} userType={userType} />

      </div>
    </div>
  );
}
