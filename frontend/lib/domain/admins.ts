import { admins } from "@/data/admins";
import type { AdminRow } from "@/structure/db";

// API migration scaffold (admin settings):
// 1) READ admins/categories/tax: replace local data reads with GET `/api/admins/settings`.
// 2) UPDATE categories: replace `saveAdminCategories` localStorage write with PATCH `/api/admins/categories`.
// 3) UPDATE tax: replace `saveTaxRate` with PATCH `/api/admins/tax-rate`.
// 4) Remove localStorage fallback once backend becomes source of truth.

const ADMIN_CATEGORIES_STORAGE_KEY = "koptal_admin_categories";
const DEFAULT_TAX_RATE = 11; // Indonesia PPN until backend settings become the source of truth

function getDefaultAdminCategories(): string[] {
  return Array.from(
    new Set(
      admins
        .flatMap((admin) => admin.categories)
        .map((category) => category.trim())
        .filter(Boolean),
    ),
  );
}

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
  return admins;
}

export function getAdminCategories(): string[] {
  const defaults = getDefaultAdminCategories();
  if (typeof window === "undefined") return defaults;

  const stored = window.localStorage.getItem(ADMIN_CATEGORIES_STORAGE_KEY);
  if (!stored) return defaults;

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return defaults;
    const normalized = normalizeCategories(parsed.filter((item): item is string => typeof item === "string"));
    return normalized.length > 0 ? normalized : defaults;
  } catch {
    return defaults;
  }
}

export function saveAdminCategories(categories: string[]): string[] {
  const normalized = normalizeCategories(categories);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ADMIN_CATEGORIES_STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
}

// Tax Rate Management (Indonesia PPN - Pajak Pertambahan Nilai)
export function getTaxRate(): number {
  return DEFAULT_TAX_RATE;
}

export function saveTaxRate(rate: number): number {
  const validated = Math.max(0, Math.min(100, Math.round(rate * 100) / 100));
  return validated;
}

export function resetTaxRate(): number {
  return DEFAULT_TAX_RATE;
}
