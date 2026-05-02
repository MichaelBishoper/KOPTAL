const express = require('express')
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getTenantById, updatePassword } = require('../dao/tenantDao');
const { comparePassword, hashPassword } = require('../utils/hashPasswords');

router.get('/profile', verifyToken, async (req, res) => {
    try {
        if (req.user.user_type !== 'tenant') {
            return res.status(403).json({ error: 'Access denied. Tenants only.' });
        }
        
        const tenant = await getTenantById(req.user.user_id);
        res.json({ id: tenant.tenant_id, name: tenant.name, email: tenant.email, verified: tenant.verified });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/password', verifyToken, async (req, res) => {
    try {
        if (req.user.user_type !== 'tenant') {
            return res.status(403).json({ error: 'Access denied. Tenants only.' });
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
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;