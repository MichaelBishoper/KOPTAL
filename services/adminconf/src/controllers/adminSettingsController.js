const pool = require('../config/db');
const { AppError } = require('../../middleware/errorHandler');
const settingsStore = require('../data/adminSettingsStore');

const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:4001';

async function readDistinctCategoriesFromProducts() {
  try {
    const res = await fetch(`${INVENTORY_SERVICE_URL}/api/products`);
    if (!res.ok) return [];
    const json = await res.json();
    const products = Array.isArray(json.data) ? json.data : [];
    const categories = products
      .map((row) => row.category)
      .filter((category) => typeof category === 'string' && category.trim() !== '');
    return [...new Set(categories)];
  } catch (err) {
    console.error('Failed to read categories from inventory service:', err.message);
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
