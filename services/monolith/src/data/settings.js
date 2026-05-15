// Mutable admin settings — seeded from admins data, persisted in-memory until DB is connected.
const { admins } = require('./admins');

const settings = {
  tax_rate: 11,
  categories: admins.flatMap((a) => a.categories ?? []),
};

function getSettings() {
  return settings;
}

function updateSettings(patch) {
  if (Array.isArray(patch.categories)) settings.categories = patch.categories;
  if (typeof patch.tax_rate === 'number') settings.tax_rate = patch.tax_rate;
  return settings;
}

module.exports = { getSettings, updateSettings };
