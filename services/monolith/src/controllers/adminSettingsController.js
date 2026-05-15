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
    return [];
  }
}

async function readCategoriesFromAdmins() {
  try {
    const res = await pool.query(
      'SELECT categories FROM admins WHERE categories IS NOT NULL'
    );
    const all = [];
    for (const row of res.rows) {
      if (Array.isArray(row.categories)) all.push(...row.categories);
    }
    return [...new Set(all.filter((c) => typeof c === 'string' && c.trim()))];
  } catch {
    return [];
  }
}

async function getAdminSettings(req, res, next) {
  try {
    const [productCategories, adminCategories] = await Promise.all([
      readDistinctCategoriesFromProducts(),
      readCategoriesFromAdmins(),
    ]);

    // admin-defined categories first, then fill in any from existing products
    const merged = [...new Set([...adminCategories, ...productCategories])];
    settingsStore.updateSettings({ categories: merged });

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
      // persist to the logged-in admin's categories column in DB
      await pool.query(
        'UPDATE admins SET categories = $1 WHERE manager_id = $2',
        [req.body.categories, req.user.user_id]
      );
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
