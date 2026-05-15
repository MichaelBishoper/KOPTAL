import type { UnitRow } from "@/structure/db";
import { fetchUnitsFromAPI } from "@/fetch/units";

// Module-level cache — populated by loadUnits().
let cache: UnitRow[] = [];

/** Fetch all units from the API and populate the module cache. */
export async function loadUnits(): Promise<UnitRow[]> {
  cache = await fetchUnitsFromAPI();
  return cache;
}

/** Returns all units from cache (call loadUnits() first). */
export function getUnits(): UnitRow[] {
  return cache;
}

export function getUnitById(unitId?: number): UnitRow | undefined {
  if (unitId == null) return undefined;
  return cache.find((unit) => unit.unit_id === unitId);
}

export function getUnitLabel(unitId?: number): string {
  const unit = getUnitById(unitId);
  return unit?.unit_name ?? "Items";
}
