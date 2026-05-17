const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/unitsController');
const { verifyToken } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Units
 *   description: Measurement units management
 */

/**
 * @swagger
 * /api/units:
 *   get:
 *     summary: List all measurement units
 *     tags: [Units]
 *     responses:
 *       200:
 *         description: List of units
 */
router.get('/', ctrl.listUnits);

/**
 * @swagger
 * /api/units/{id}:
 *   get:
 *     summary: Get unit by ID
 *     tags: [Units]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Unit details
 */
router.get('/:id', ctrl.getUnit);

/**
 * @swagger
 * /api/units:
 *   post:
 *     summary: Create a new unit
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
 *             properties:
 *               unit_name:
 *                 type: string
 *               unit_symbol:
 *                 type: string
 *               unit_type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Unit created
 */
router.post('/', verifyToken, ctrl.createUnit);

/**
 * @swagger
 * /api/units/{id}:
 *   put:
 *     summary: Update unit
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
 *     responses:
 *       200:
 *         description: Unit updated
 */
router.put('/:id', verifyToken, ctrl.updateUnit);

/**
 * @swagger
 * /api/units/{id}:
 *   delete:
 *     summary: Remove unit
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
 *         description: Unit removed
 */
router.delete('/:id', verifyToken, ctrl.removeUnit);

module.exports = router;
