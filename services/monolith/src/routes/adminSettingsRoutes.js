const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth');
const ctrl = require('../controllers/adminSettingsController');

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Get admin settings (categories and tax rate)
 *     tags: [Admin Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
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
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 *                     tax_rate:
 *                       type: number
 *       403:
 *         description: Access denied
 */
router.get('/settings', ctrl.getAdminSettings);

/**
 * @swagger
 * /settings:
 *   put:
 *     summary: Update admin settings
 *     tags: [Admin Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               tax_rate:
 *                 type: number
 *     responses:
 *       200:
 *         description: Settings updated successfully
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
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 *                     tax_rate:
 *                       type: number
 *       403:
 *         description: Access denied
 */

router.put('/settings', verifyToken, ctrl.updateAdminSettings);

module.exports = router;
