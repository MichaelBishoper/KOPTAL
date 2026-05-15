// routes/purchaseOrderRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth');
const ctrl = require('../controllers/purchaseOrdersController');

// All Protected
router.post('/', verifyToken, ctrl.createPurchaseOrder);
router.get('/my-orders', verifyToken, ctrl.getMyOrders);
router.get('/tenant-orders', verifyToken, ctrl.getTenantOrders);
router.get('/:id', verifyToken, ctrl.getOrderById);
router.put('/:id/status', verifyToken, ctrl.updateOrderStatus);

module.exports = router;