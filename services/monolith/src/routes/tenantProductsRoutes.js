const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tenantProductsController');
const { verifyToken } = require('../../middleware/auth');

/**
 * @swagger
 * /products:
 *   get:
 *     summary: List all products (public)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
router.get('/', ctrl.listProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID (public)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get('/:id', ctrl.getProduct);

// protected
/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product (Tenant only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - quantity
 *               - unit_id
 *               - price
 *             properties:
 *               tenant_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unit_id:
 *                 type: integer
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               image_url:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       403:
 *         description: Forbidden - tenant mismatch
 */
router.post('/', verifyToken, ctrl.createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product (Tenant only)
 *     tags: [Products]
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
 *             properties:
 *               name:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unit_id:
 *                 type: integer
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               image_url:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       403:
 *         description: Forbidden - tenant mismatch
 *       404:
 *         description: Product not found
 */
router.put('/:id', verifyToken, ctrl.updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product (Tenant only)
 *     tags: [Products]
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
 *         description: Product deleted successfully
 *       403:
 *         description: Forbidden - tenant mismatch
 *       404:
 *         description: Product not found
 */
router.delete('/:id', verifyToken, ctrl.removeProduct);

module.exports = router;
