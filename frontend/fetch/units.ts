import type { UnitRow } from "@/structure/db";

const BASE = process.env.NEXT_PUBLIC_MONOLITH_URL ?? "http://localhost:4000";

export async function fetchUnitsFromAPI(): Promise<UnitRow[]> {
  try {
    const res = await fetch(`${BASE}/api/units`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    // Monolith wraps responses in { success, data }.
    return Array.isArray(json) ? json : (json.data ?? []);
  } catch (err) {
    console.error("[fetch/units] fetchUnitsFromAPI failed:", err);
    return [];
  }
}
