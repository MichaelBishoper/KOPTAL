const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getCustomerById, updateCustomer, updatePassword } = require('../dao/customerDao');
const { comparePassword, hashPassword } = require('../utils/hashPasswords');
const { AppError } = require('../middleware/errorHandler');

/**
 * @swagger
 * /customer/profile:
 *   get:
 *     summary: Get customer profile (Customer or Admin only)
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customer_id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 company:
 *                   type: string
 *                 tax_id:
 *                   type: string
 *                 billing_address:
 *                   type: string
 *                 shipping_address:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       403:
 *         description: Access denied
 *       404:
 *         description: Customer not found
 */
router.get('/profile', verifyToken, async (req, res, next) => {
    try {
        if (req.user.user_type !== 'customer') {
            throw new AppError('Access denied', 403);
        }
        
        const customer = await getCustomerById(req.user.user_id);
        if (!customer) {
            throw new AppError('Customer not found', 404);
        }
        
        const { password_hash, ...profile } = customer;
        res.json(profile);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /customer/profile:
 *   put:
 *     summary: Update customer profile (Customer or Admin only)
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               company:
 *                 type: string
 *               tax_id:
 *                 type: string
 *               billing_address:
 *                 type: string
 *               shipping_address:
 *                 type: string
 *               image:
 *                 type: string
 *               image_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       403:
 *         description: Access denied
 */
router.put('/profile', verifyToken, async (req, res, next) => {
    try {
        if (req.user.user_type !== 'customer') {
            throw new AppError('Access denied', 403);
        }
        
        const { name, email, phone, company, tax_id, billing_address, shipping_address, image, image_url } = req.body;
        
        const updated = await updateCustomer(req.user.user_id, {
            name, email, phone, company, tax_id, billing_address, shipping_address,
            image_url: image_url ?? image ?? undefined,
        });
        
        const { password_hash, ...profile } = updated;
        res.json(profile);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /customer/password:
 *   put:
 *     summary: Update customer password (Customer or Admin only)
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Current password is incorrect
 *       403:
 *         description: Access denied
 */
router.put('/password', verifyToken, async (req, res, next) => {
    try {
        if (req.user.user_type !== 'customer') {
            throw new AppError('Access denied', 403);
        }
        
        const { oldPassword, newPassword } = req.body;
        
        const customer = await getCustomerById(req.user.user_id);
        
        const isValid = await comparePassword(oldPassword, customer.password_hash);
        if (!isValid) {
            throw new AppError('Current password is incorrect', 401);
        }
        
        const newHash = await hashPassword(newPassword);
        await updatePassword(req.user.user_id, newHash);
        
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;