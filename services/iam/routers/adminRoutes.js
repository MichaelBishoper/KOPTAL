const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getAdminById, updateAdmin, updatePassword } = require('../dao/adminDao');
const { updateVerfied } = require('../dao/tenantDao')
const { comparePassword, hashPassword } = require('../utils/hashPasswords');
const { AppError } = require('../middleware/errorHandler');

/**
 * @swagger
 * /admin/profile:
 *   get:
 *     summary: Get admin profile
 *     tags: [Admin]
 *     security:
 *         - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 manager_id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       403:
 *         description: Access denied
 *       404:
 *         description: Admin not found
 */

// Get own profile
router.get('/profile', verifyToken, async (req, res, next) => {
    try {
        if (req.user.user_type !== 'admin') {
            throw new AppError('Access denied', 403);
        }
        
        const admin = await getAdminById(req.user.user_id);
        if (!admin) {
            throw new AppError('Admin not found', 404);
        }
        
        const { password_hash, ...profile } = admin;
        res.json(profile);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /admin/profile:
 *   put:
 *     summary: Update admin profile
 *     tags: [Admin]
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

// Update own profile
router.put('/profile', verifyToken, async (req, res, next) => {
    try {
        if (req.user.user_type !== 'admin') {
            throw new AppError('Access denied', 403);
        }
        
        const { name, email, phone, image, image_url } = req.body;
        
        const updated = await updateAdmin(req.user.user_id, {
            name, email, phone,
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
 * /admin/password:
 *   put:
 *     summary: Update admin password
 *     tags: [Admin]
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

// Update password
router.put('/password', verifyToken, async (req, res, next) => {
    try {
        if (req.user.user_type !== 'admin') {
            throw new AppError('Access denied', 403);
        }
        
        const { oldPassword, newPassword } = req.body;
        
        const admin = await getAdminById(req.user.user_id);
        
        const isValid = await comparePassword(oldPassword, admin.password_hash);
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

/**
 * @swagger
 * /admin/verify-tenant/{tenant_id}:
 *   put:
 *     summary: Verify or unverify a tenant (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenant_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the tenant to verify/unverify
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - verified
 *             properties:
 *               verified:
 *                 type: boolean
 *                 description: true to verify, false to unverify
 *     responses:
 *       200:
 *         description: Tenant verification status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Verified must be true or false
 *       403:
 *         description: Access denied
 *       404:
 *         description: Tenant not found
 */

// Update verified
router.put('/verify-tenant/:tenant_id', verifyToken, async (req, res, next) => {
    try {
        if (req.user.user_type !== 'admin') {
            throw new AppError('Access denied. Admins only.', 403);
        }
        
        const { tenant_id } = req.params;
        const { verified } = req.body; // true or false
            
        if (typeof verified !== 'boolean') {
            throw new AppError('Verified must be true or false', 400);
        }
        
        const updated = await updateVerfied(verified, tenant_id);
        
        if (!updated) {
            throw new AppError('Tenant not found', 404);
        }
        
        res.json({
            success: true,
            message: verified ? 'Tenant verified successfully' : 'Tenant unverified',
            data: updated
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;