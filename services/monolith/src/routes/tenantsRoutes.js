const { Router } = require('express');
const { tenants } = require('../data/tenants');

const router = Router();

// GET /api/tenants
router.get('/', (req, res) => {
  res.json(tenants);
});

// GET /api/tenants/:id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const tenant = tenants.find((t) => t.tenant_id === id);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  res.json(tenant);
});

module.exports = router;
