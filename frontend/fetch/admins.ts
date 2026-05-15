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
    const res = await fetch("/api/monolith/admin/settings", {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json = (await res.json()) as { data?: { categories?: unknown; tax_rate?: unknown } };
    const data = json.data ?? {};

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
    const res = await fetch("/api/monolith/admin/settings", {
      method: "PUT",
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patch),
    });

    if (!res.ok) return null;

    const json = (await res.json()) as { data?: { categories?: unknown; tax_rate?: unknown } };
    const data = json.data ?? {};

    return {
      categories: normalizeCategories(data.categories),
      tax_rate: normalizeTaxRate(data.tax_rate),
    };
  } catch {
    return null;
  }
}
