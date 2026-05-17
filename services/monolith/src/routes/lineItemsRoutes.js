const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth');
const lineItem = require('../controllers/lineItemsController');

/**
 * @swagger
 * /line-items:
 *   post:
 *     summary: Add a line item to a purchase order
 *     tags: [Line Items]
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
 *         description: Line item added successfully
 *       403:
 *         description: You can only add items to your own orders
 *       404:
 *         description: Order not found
 */
router.post('/', verifyToken, lineItem.addLineItem);

/**
 * @swagger
 * /line-items/order/{po_id}:
 *   get:
 *     summary: Get all line items for a purchase order
 *     tags: [Line Items]
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
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 */
router.get('/order/:po_id', verifyToken, lineItem.getLineItems);

/**
 * @swagger
 * /line-items/{po_item_id}:
 *   delete:
 *     summary: Remove a line item from a purchase order
 *     tags: [Line Items]
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
 *         description: Line item removed successfully
 *       403:
 *         description: You can only remove items from your own orders
 *       404:
 *         description: Line item not found
 */
router.delete('/:po_item_id', verifyToken, lineItem.removeLineItem);

module.exports = router;
// James is hella gay