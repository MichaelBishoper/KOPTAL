const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getAdminById, updateAdmin, updatePassword } = require('../dao/adminDao');
const { updateVerfied } = require('../dao/tenantDao')
const { comparePassword, hashPassword } = require('../utils/hashPasswords');
const { AppError } = require('../middleware/errorHandler');

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

// Update own profile
router.put('/profile', verifyToken, async (req, res, next) => {
    try {
        if (req.user.user_type !== 'admin') {
            throw new AppError('Access denied', 403);
        }
        
        const { name, email, phone } = req.body;
        
        const updated = await updateAdmin(req.user.user_id, { name, email, phone });
        
        const { password_hash, ...profile } = updated;
        res.json(profile);
    } catch (error) {
        next(error);
    }
});

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