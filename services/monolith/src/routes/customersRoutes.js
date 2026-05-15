const { Router } = require('express');
const { customers } = require('../data/customers');

const router = Router();

// GET /api/customers
router.get('/', (req, res) => {
  // Strip password_hash before sending.
  const safe = customers.map(({ password_hash, ...rest }) => rest);
  res.json(safe);
});

// GET /api/customers/:id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const customer = customers.find((c) => c.customer_id === id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  const { password_hash, ...safe } = customer;
  res.json(safe);
});

module.exports = router;
