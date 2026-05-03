const express = require('express')
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getTenantById, updatePassword } = require('../dao/tenantDao');
const { comparePassword, hashPassword } = require('../utils/hashPasswords');
const { AppError } = require('../middleware/errorHandler');

router.get('/profile', verifyToken, async (req, res) => {
    try {
        if (req.user.user_type !== 'tenant' || req.user.user_type !== 'admin') {
            return res.status(403).json({ error: 'Access denied.' });
        }
        
        const tenant = await getTenantById(req.user.user_id);
        res.json({ id: tenant.tenant_id, name: tenant.name, email: tenant.email, verified: tenant.verified });
    } catch (error) {
        next(error);
    }
});

router.put('/password', verifyToken, async (req, res) => {
    try {
        if (req.user.user_type !== 'tenant' || req.user.user_type !== 'admin') {
            return res.status(403).json({ error: 'Access denied.' });
        }
        
        const { oldPassword, newPassword } = req.body;
        const tenant = await getTenantById(req.user.user_id);
        
        const isValid = await comparePassword(oldPassword, tenant.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        
        const newHash = await hashPassword(newPassword);
        await updatePassword(req.user.user_id, newHash);
        
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
});

router.put('/:id', verifyToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const existingTenant = await getTenantById(id);
        if (!existingTenant) {
            throw new AppError('Tenant not found', 404);
        }
        
        const { name, email, phone } = req.body;
        
        const updatedTenant = await updateTenant(id, { name, email, phone });
        
        res.json({
            success: true,
            data: {
                tenant_id: updatedTenant.tenant_id,
                name: updatedTenant.name,
                email: updatedTenant.email,
                phone: updatedTenant.phone,
                verified: updatedTenant.verified
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;