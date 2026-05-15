const { Router } = require('express');
const { getSettings, updateSettings } = require('../data/settings');

const router = Router();

// GET /api/admins/settings — returns categories and tax rate.
router.get('/settings', (req, res) => {
  res.json(getSettings());
});

// PUT /api/admins/settings — update categories and/or tax rate.
router.put('/settings', (req, res) => {
  const { categories, tax_rate } = req.body;
  const patch = {};
  if (Array.isArray(categories)) patch.categories = categories;
  if (typeof tax_rate === 'number' && tax_rate >= 0 && tax_rate <= 100) patch.tax_rate = tax_rate;
  res.json(updateSettings(patch));
});

module.exports = router;
