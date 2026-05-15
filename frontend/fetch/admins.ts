const BASE = process.env.NEXT_PUBLIC_MONOLITH_URL ?? "http://localhost:4000";

export type AdminSettings = {
  categories: string[];
  tax_rate: number;
};

export async function fetchAdminSettingsFromAPI(): Promise<AdminSettings> {
  try {
    const res = await fetch(`${BASE}/api/admins/settings`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[fetch/admins] fetchAdminSettingsFromAPI failed:", err);
    return { categories: [], tax_rate: 11 };
  }
}

export async function updateAdminSettingsOnAPI(
  patch: Partial<AdminSettings>,
): Promise<AdminSettings | undefined> {
  try {
    const res = await fetch(`${BASE}/api/admins/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[fetch/admins] updateAdminSettingsOnAPI failed:", err);
    return undefined;
  }
}
