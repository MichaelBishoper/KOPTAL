const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth');
const ctrl = require('../controllers/purchaseOrdersController');

/**
 * @swagger
 * tags:
 *   name: PurchaseOrders
 *   description: Purchase order management
 */

/**
 * @swagger
 * /api/purchaseOrders:
 *   post:
 *     summary: Create a new purchase order
 *     tags: [PurchaseOrders]
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
 *         description: Purchase order created
 *       401:
 *         description: Unauthorized
 */
router.post('/', verifyToken, ctrl.createPurchaseOrder);

/**
 * @swagger
 * /api/purchaseOrders/my-orders:
 *   get:
 *     summary: Get purchase orders for the logged-in customer
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of purchase orders
 */
router.get('/my-orders', verifyToken, ctrl.getMyOrders);

/**
 * @swagger
 * /api/purchaseOrders/tenant-orders:
 *   get:
 *     summary: Get purchase orders for the logged-in tenant
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of purchase orders
 */
router.get('/tenant-orders', verifyToken, ctrl.getTenantOrders);

/**
 * @swagger
 * /api/purchaseOrders/{id}:
 *   get:
 *     summary: Get purchase order by ID
 *     tags: [PurchaseOrders]
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
 *         description: Purchase order details
 *       404:
 *         description: Not found
 */
router.get('/:id', verifyToken, ctrl.getOrderById);

/**
 * @swagger
 * /api/purchaseOrders/{id}/status:
 *   put:
 *     summary: Update purchase order status
 *     tags: [PurchaseOrders]
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
 *                 enum: [draft, submitted, confirmed, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put('/:id/status', verifyToken, ctrl.updateOrderStatus);

module.exports = router;
