    // authentication routes (login and register)
    const express = require('express')
    const router = express.Router();
    const jwt = require('jsonwebtoken')
    const { verifyToken } = require('../middleware/auth');
    const { getTenantById, getTenantByEmail, createTenant, updateTenant } = require('../dao/tenantDao');
    const { getCustomerById, getCustomerByEmail, createCustomer, updateCustomer } = require('../dao/customerDao');
    const { getAdminById, getAdminByEmail, createAdmin, updateAdmin } = require('../dao/adminDao');
    const { comparePassword, hashPassword } = require('../utils/hashPasswords');
    const { AppError } = require('../middleware/errorHandler');

    router.post('/login', async (req, res, next) => {
        const { email, password, user_type } = req.body; 
        
        // Choose user based on role
        let user;
        if (user_type === 'tenant') {
            user = await getTenantByEmail(email);
        } else if (user_type === 'customer') {
            user = await getCustomerByEmail(email);
        } else if (user_type === 'admin') {
            user = await getAdminByEmail(email);
        } else {
            return next(new AppError('Invalid user type', 400));
        }
        
        if (!user || !await comparePassword(password, user.password_hash)) {
            return next(new AppError('Invalid credentials', 401));
        }
        
        const token = jwt.sign(
            { 
                user_id: user.tenant_id || user.customer_id || user.manager_id, 
                user_type: user_type, 
                email: user.email 
            },
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
        } else if (user_type === 'admin') {
            userData.password_hash = await hashPassword(userData.password);
            result = await createAdmin(userData); 
        } else {
            next(error);
        }
        
        res.status(201).json({ message: `${user_type} created successfully`, id: result.id });
    });

    module.exports = router;