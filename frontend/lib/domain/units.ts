import { units } from "@/data/units";
import type { UnitRow } from "@/structure/db";

// Replace the `units` import with `fetch('/api/units')` when backend data is ready.

export function getUnits(): UnitRow[] {
  return units;
}

export function getUnitById(unitId?: number): UnitRow | undefined {
  if (unitId == null) return undefined;
  return units.find((unit) => unit.unit_id === unitId);
}

export function getUnitLabel(unitId?: number): string {
  const unit = getUnitById(unitId);
  return unit?.unit_name ?? "Items";
}