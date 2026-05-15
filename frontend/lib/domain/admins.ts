import type { AdminRow } from "@/structure/db";
import { fetchAdminSettingsFromAPI, updateAdminSettingsOnAPI } from "@/fetch/admins";

const DEFAULT_TAX_RATE = 11;
const DEFAULT_CATEGORIES = ["Vegetables", "Fruits", "Spices", "Rice"];

let cachedCategories: string[] = [...DEFAULT_CATEGORIES];
let cachedTaxRate = DEFAULT_TAX_RATE;

function normalizeCategories(categories: string[]): string[] {
  return Array.from(
    new Set(
      categories
        .map((category) => category.trim())
        .filter(Boolean),
    ),
  );
}

export function getAdmins(): AdminRow[] {
  // Admin rows are managed by IAM profile endpoints, not frontend static data.
  return [];
}

export function getAdminCategories(): string[] {
  return [...cachedCategories];
}

export async function loadAdminSettings(): Promise<{ categories: string[]; taxRate: number }> {
  const settings = await fetchAdminSettingsFromAPI();
  if (settings) {
    cachedCategories = normalizeCategories(settings.categories);
    cachedTaxRate = settings.tax_rate;
  }

  return {
    categories: [...cachedCategories],
    taxRate: cachedTaxRate,
  };
}

export async function saveAdminCategories(categories: string[]): Promise<string[]> {
  const normalized = normalizeCategories(categories);

  const updated = await updateAdminSettingsOnAPI({ categories: normalized });
  if (updated) {
    cachedCategories = normalizeCategories(updated.categories);
    cachedTaxRate = updated.tax_rate;
    return [...cachedCategories];
  }

  cachedCategories = normalized;
  return [...cachedCategories];
}

export function getTaxRate(): number {
  return cachedTaxRate;
}

export async function saveTaxRate(rate: number): Promise<number> {
  const validated = Math.max(0, Math.min(100, Math.round(rate * 100) / 100));
  const updated = await updateAdminSettingsOnAPI({ tax_rate: validated });
  if (updated) {
    cachedCategories = normalizeCategories(updated.categories);
    cachedTaxRate = updated.tax_rate;
    return cachedTaxRate;
  }

  cachedTaxRate = validated;
  return cachedTaxRate;
}

export async function resetTaxRate(): Promise<number> {
  return saveTaxRate(DEFAULT_TAX_RATE);
}
