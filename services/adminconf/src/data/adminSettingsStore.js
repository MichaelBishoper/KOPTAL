const DEFAULT_TAX_RATE = 11;

let categoriesCache = [];
let taxRateCache = DEFAULT_TAX_RATE;

function normalizeCategories(categories) {
  return Array.from(
    new Set(
      categories
        .filter((category) => typeof category === 'string')
        .map((category) => category.trim())
        .filter(Boolean)
    )
  );
}

function getSettings() {
  return {
    categories: [...categoriesCache],
    tax_rate: taxRateCache,
  };
}

function updateSettings(patch = {}) {
  if (Array.isArray(patch.categories)) {
    categoriesCache = normalizeCategories(patch.categories);
  }

  if (typeof patch.tax_rate === 'number' && Number.isFinite(patch.tax_rate)) {
    taxRateCache = Math.max(0, Math.min(100, Math.round(patch.tax_rate * 100) / 100));
  }

  return getSettings();
}

function seedCategories(categories) {
  if (!categoriesCache.length) {
    categoriesCache = normalizeCategories(Array.isArray(categories) ? categories : []);
  }
}

module.exports = {
  DEFAULT_TAX_RATE,
  getSettings,
  updateSettings,
  seedCategories,
};
