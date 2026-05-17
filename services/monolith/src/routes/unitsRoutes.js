const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/unitsController');
const { verifyToken } = require('../../middleware/auth');

/**
 * @swagger
 * /units:
 *   get:
 *     summary: List all units (public)
 *     tags: [Units]
 *     responses:
 *       200:
 *         description: List of units
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
 *                     type: object
 *                     properties:
 *                       unit_id:
 *                         type: integer
 *                       unit_name:
 *                         type: string
 *                       unit_symbol:
 *                         type: string
 *                       unit_type:
 *                         type: string
 */
router.get('/', ctrl.listUnits);

/**
 * @swagger
 * /units/{id}:
 *   get:
 *     summary: Get unit by ID (public)
 *     tags: [Units]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Unit found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     unit_id:
 *                       type: integer
 *                     unit_name:
 *                       type: string
 *                     unit_symbol:
 *                       type: string
 *                     unit_type:
 *                       type: string
 *       404:
 *         description: Unit not found
 */
router.get('/:id', ctrl.getUnit);

// protected
/**
 * @swagger
 * /units:
 *   post:
 *     summary: Create a new unit (Admin only)
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - unit_name
 *               - unit_symbol
 *               - unit_type
 *             properties:
 *               unit_name:
 *                 type: string
 *               unit_symbol:
 *                 type: string
 *               unit_type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Unit created successfully
 *       403:
 *         description: Access denied
 */
router.post('/', verifyToken, ctrl.createUnit);

/**
 * @swagger
 * /units/{id}:
 *   put:
 *     summary: Update a unit (Admin only)
 *     tags: [Units]
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
 *               unit_name:
 *                 type: string
 *               unit_symbol:
 *                 type: string
 *               unit_type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Unit updated successfully
 *       404:
 *         description: Unit not found
 *       403:
 *         description: Access denied
 */
router.put('/:id', verifyToken, ctrl.updateUnit);

/**
 * @swagger
 * /units/{id}:
 *   delete:
 *     summary: Delete a unit (Admin only)
 *     tags: [Units]
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
 *         description: Unit deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Unit not found
 */
router.delete('/:id', verifyToken, ctrl.removeUnit);

module.exports = router;
