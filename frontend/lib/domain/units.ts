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

export type ProductUnitKind = "grams" | "pieces";

export function getUnitKind(unitId?: number): ProductUnitKind {
  return unitId === 1 ? "grams" : "pieces";
}

export function getUnitLabel(unitId?: number): string {
  return getUnitKind(unitId);
}

export function getUnitStep(unitId?: number): number {
  return getUnitKind(unitId) === "grams" ? 100 : 1;
}

export function getUnitPerPriceLabel(unitId?: number): string {
  return getUnitKind(unitId) === "grams" ? "100 grams" : "piece";
}