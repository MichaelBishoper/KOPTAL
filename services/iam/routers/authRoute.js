// authentication routes (login and register)
const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const { verifyToken } = require('../middleware/auth');
const { getTenantById, getTenantByEmail, createTenant, updateTenant } = require('../dao/tenantDao');
const { comparePassword, hashPassword } = require('../utils/hashPasswords');

router.post('/login', async (req, res) => {
    const { email, password, user_type } = req.body; 
    
    let user;
    if (user_type === 'tenant') {
        user = await getTenantByEmail(email);
    } else {
        return;
    }
    
    if (!user || !await comparePassword(password, user.password_hash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
        { user_id: user.tenant_id || user.customer_id || user.manager_id, 
          user_type: user_type, 
          email: user.email },
        process.env.JWT_SECRET
    );
    
    res.json({ token, user_type });
});

router.post('/register', async (req, res) => {
    const { user_type, ...userData } = req.body;
    
    let result;
    if (user_type === 'tenant') {
        userData.password_hash = await hashPassword(userData.password);
        result = await createTenant(userData);
    } else if (user_type === 'customer') {
        userData.password_hash = await hashPassword(userData.password);
        result = await createCustomer(userData);
    } else {
        return res.status(400).json({ error: 'Invalid user type' });
    }
    
    res.status(201).json({ message: `${user_type} created successfully`, id: result.id });
});

module.exports = router;