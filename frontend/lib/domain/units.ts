import type { UnitRow } from "@/structure/db";
import { fetchUnitsFromAPI } from "@/fetch/units";

let cachedUnits: UnitRow[] = [];

export function getUnits(): UnitRow[] {
  return [...cachedUnits];
}

export async function loadUnits(): Promise<UnitRow[]> {
  const rows = await fetchUnitsFromAPI();
  cachedUnits = rows;
  return [...cachedUnits];
}

export function getUnitById(unitId?: number): UnitRow | undefined {
  if (unitId == null) return undefined;
  return cachedUnits.find((unit) => unit.unit_id === unitId);
}

export function getUnitLabel(unitId?: number): string {
  const unit = getUnitById(unitId);
  return unit?.unit_name ?? "Items";
}