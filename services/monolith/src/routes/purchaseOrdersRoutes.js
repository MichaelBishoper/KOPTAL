// routes/purchaseOrderRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth');
const ctrl = require('../controllers/purchaseOrdersController');

// All Protected
/**
 * @swagger
 * /purchase-orders:
 *   post:
 *     summary: Create a new purchase order
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenant_id
 *               - shipping_address
 *             properties:
 *               tenant_id:
 *                 type: integer
 *               shipping_address:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Purchase order created successfully
 *       403:
 *         description: Only customers can create purchase orders
 */
router.post('/', verifyToken, ctrl.createPurchaseOrder);

/**
 * @swagger
 * /purchase-orders/my-orders:
 *   get:
 *     summary: Get customer's own orders
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customer orders
 *       403:
 *         description: Access denied
 */
router.get('/my-orders', verifyToken, ctrl.getMyOrders);

/**
 * @swagger
 * /purchase-orders/tenant-orders:
 *   get:
 *     summary: Get tenant's incoming orders
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tenant orders
 *       403:
 *         description: Access denied
 */
router.get('/tenant-orders', verifyToken, ctrl.getTenantOrders);

/**
 * @swagger
 * /purchase-orders/{id}:
 *   get:
 *     summary: Get purchase order by ID
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Purchase order with line items
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 */
router.get('/:id', verifyToken, ctrl.getOrderById);

/**
 * @swagger
 * /purchase-orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status or order locked
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 */
router.put('/:id/status', verifyToken, ctrl.updateOrderStatus);

module.exports = router;