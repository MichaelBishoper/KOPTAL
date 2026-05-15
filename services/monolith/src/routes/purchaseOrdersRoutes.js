const { Router } = require('express');
const { getPurchaseOrders, purchaseOrderRows } = require('../data/purchase-orders');

const router = Router();

// GET /api/purchase-orders?customer_id=1
router.get('/', (req, res) => {
  const orders = getPurchaseOrders();
  const customerId = req.query.customer_id ? Number(req.query.customer_id) : null;
  if (customerId !== null) {
    return res.json(orders.filter((o) => o.customer_id === customerId));
  }
  res.json(orders);
});

// GET /api/purchase-orders/:id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const orders = getPurchaseOrders();
  const order = orders.find((o) => o.po_id === id);
  if (!order) return res.status(404).json({ error: 'Purchase order not found' });
  res.json(order);
});

module.exports = router;
