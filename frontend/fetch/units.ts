import type { UnitRow } from "@/structure/db";

type Envelope = {
  data?: unknown;
};

function toUnitRow(raw: unknown): UnitRow | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;

  const unit_id = Number(row.unit_id);
  if (!Number.isFinite(unit_id)) return null;

  return {
    unit_id,
    unit_name: String(row.unit_name ?? "Items"),
    unit_symbol: String(row.unit_symbol ?? ""),
    unit_type: String(row.unit_type ?? ""),
  };
}

export async function fetchUnitsFromAPI(): Promise<UnitRow[]> {
  try {
    const res = await fetch("/api/monolith/units", {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) return [];
    const json = (await res.json()) as Envelope;
    const rows = Array.isArray(json.data) ? json.data : [];
    return rows.map(toUnitRow).filter((row): row is UnitRow => Boolean(row));
  } catch {
    return [];
  }
}
