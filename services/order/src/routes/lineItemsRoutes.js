const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth');
const lineItem = require('../controllers/lineItemsController');

/**
 * @swagger
 * tags:
 *   name: LineItems
 *   description: Purchase order line items management
 */

/**
 * @swagger
 * /api/lineItems:
 *   post:
 *     summary: Add a line item to a purchase order
 *     tags: [LineItems]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - po_id
 *               - product_id
 *               - quantity
 *               - unit_price
 *             properties:
 *               po_id:
 *                 type: integer
 *               product_id:
 *                 type: integer
 *               quantity:
 *                 type: number
 *               unit_price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Line item added
 */
router.post('/', verifyToken, lineItem.addLineItem);

/**
 * @swagger
 * /api/lineItems/order/{po_id}:
 *   get:
 *     summary: Get line items for a specific purchase order
 *     tags: [LineItems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: po_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of line items
 */
router.get('/order/:po_id', verifyToken, lineItem.getLineItems);

/**
 * @swagger
 * /api/lineItems/{po_item_id}:
 *   delete:
 *     summary: Remove a line item
 *     tags: [LineItems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: po_item_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Line item removed
 */
router.delete('/:po_item_id', verifyToken, lineItem.removeLineItem);

module.exports = router;
