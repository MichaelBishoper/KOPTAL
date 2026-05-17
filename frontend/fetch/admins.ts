import api from "@/lib/axios";

export type AdminSettings = {
  categories: string[];
  tax_rate: number;
};

function normalizeCategories(categories: unknown): string[] {
  if (!Array.isArray(categories)) return [];
  return Array.from(
    new Set(
      categories
        .filter((category): category is string => typeof category === "string")
        .map((category) => category.trim())
        .filter(Boolean)
    )
  );
}

function normalizeTaxRate(taxRate: unknown): number {
  const parsed = Number(taxRate);
  if (!Number.isFinite(parsed)) return 11;
  return Math.max(0, Math.min(100, Math.round(parsed * 100) / 100));
}

export async function fetchAdminSettingsFromAPI(): Promise<AdminSettings | null> {
  try {
    const res = await api.get<{ data?: { categories?: unknown; tax_rate?: unknown } }>(
      "/api/adminconf/admin/settings"
    );

    const data = res.data.data ?? {};

    return {
      categories: normalizeCategories(data.categories),
      tax_rate: normalizeTaxRate(data.tax_rate),
    };
  } catch {
    return null;
  }
}

export async function updateAdminSettingsOnAPI(patch: Partial<AdminSettings>): Promise<AdminSettings | null> {
  try {
    const res = await api.put<{ data?: { categories?: unknown; tax_rate?: unknown } }>(
      "/api/adminconf/admin/settings",
      patch
    );

    const data = res.data.data ?? {};

    return {
      categories: normalizeCategories(data.categories),
      tax_rate: normalizeTaxRate(data.tax_rate),
    };
  } catch {
    return null;
  }
}
