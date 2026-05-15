import { fetchAdminSettingsFromAPI, updateAdminSettingsOnAPI } from "@/fetch/admins";

// Module-level cache — populated by loadAdminSettings().
let cachedCategories: string[] = ["Vegetables", "Fruits", "Herbs", "Grains"];
let cachedTaxRate = 11;

/** Fetch admin settings from the API and seed the in-memory cache. */
export async function loadAdminSettings(): Promise<void> {
  const settings = await fetchAdminSettingsFromAPI();
  if (settings.categories.length > 0) cachedCategories = settings.categories;
  cachedTaxRate = settings.tax_rate;
}

export function getAdminCategories(): string[] {
  return cachedCategories;
}

export function getTaxRate(): number {
  return cachedTaxRate;
}

export async function saveAdminCategories(categories: string[]): Promise<string[]> {
  const normalized = Array.from(
    new Set(categories.map((c) => c.trim()).filter(Boolean)),
  );
  const result = await updateAdminSettingsOnAPI({ categories: normalized });
  if (result) cachedCategories = result.categories;
  return cachedCategories;
}

export async function saveTaxRate(rate: number): Promise<number> {
  const clamped = Math.max(0, Math.min(100, Math.round(rate * 100) / 100));
  const result = await updateAdminSettingsOnAPI({ tax_rate: clamped });
  if (result) cachedTaxRate = result.tax_rate;
  return cachedTaxRate;
}

export async function resetTaxRate(): Promise<number> {
  const result = await updateAdminSettingsOnAPI({ tax_rate: 11 });
  if (result) cachedTaxRate = result.tax_rate;
  return cachedTaxRate;
}

