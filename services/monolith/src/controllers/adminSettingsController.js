const pool = require('../config/db');
const { AppError } = require('../../middleware/errorHandler');
const settingsStore = require('../data/adminSettingsStore');

async function readDistinctCategoriesFromProducts() {
  try {
    const res = await pool.query(
      "SELECT DISTINCT category FROM tenant_products WHERE category IS NOT NULL AND TRIM(category) <> '' ORDER BY category"
    );

    return res.rows
      .map((row) => row.category)
      .filter((category) => typeof category === 'string');
  } catch {
    // Keep endpoint available even when DB is offline; cache/defaults remain source for now.
    return [];
  }
}

async function getAdminSettings(req, res, next) {
  try {
    const categories = await readDistinctCategoriesFromProducts();
    settingsStore.seedCategories(categories);

    const settings = settingsStore.getSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
}

async function updateAdminSettings(req, res, next) {
  try {
    if (!req.user || req.user.user_type !== 'admin') {
      return next(new AppError('Access denied. Admins only.', 403));
    }

    const patch = {};
    if (Array.isArray(req.body.categories)) {
      patch.categories = req.body.categories;
    }

    if (typeof req.body.tax_rate === 'number' && Number.isFinite(req.body.tax_rate)) {
      patch.tax_rate = req.body.tax_rate;
    }

    const settings = settingsStore.updateSettings(patch);
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAdminSettings,
  updateAdminSettings,
};
