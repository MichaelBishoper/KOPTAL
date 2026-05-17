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

async function readCategoriesFromSettings() {
  try {
    const res = await pool.query(
      'SELECT categories FROM admin_settings WHERE id = 1'
    );
    if (res.rows.length > 0 && Array.isArray(res.rows[0].categories)) {
      return res.rows[0].categories;
    }
    return [];
  } catch {
    return [];
  }
}

async function getAdminSettings(req, res, next) {
  try {
    const dbRes = await pool.query('SELECT categories, tax_rate FROM admin_settings WHERE id = 1');
    let dbCategories = [];
    let dbTaxRate = 11.00;
    if (dbRes.rows.length > 0) {
      dbCategories = dbRes.rows[0].categories || [];
      dbTaxRate = Number(dbRes.rows[0].tax_rate);
    }

    const productCategories = await readDistinctCategoriesFromProducts();
    const merged = [...new Set([...dbCategories, ...productCategories])];
    
    settingsStore.updateSettings({ categories: merged, tax_rate: dbTaxRate });

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
      await pool.query(
        'UPDATE admin_settings SET categories = $1 WHERE id = 1',
        [req.body.categories]
      );
    }

    if (typeof req.body.tax_rate === 'number' && Number.isFinite(req.body.tax_rate)) {
      patch.tax_rate = req.body.tax_rate;
      await pool.query(
        'UPDATE admin_settings SET tax_rate = $1 WHERE id = 1',
        [req.body.tax_rate]
      );
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
