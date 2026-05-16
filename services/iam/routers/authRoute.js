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

<<<<<<< Updated upstream
module.exports = router;
=======
            if (!email || !password || !user_type) {
                return next(new AppError('Missing login fields', 400));
            }

            // Choose user based on role
            let user;
            if (user_type === 'tenant') {
                user = await withDbTimeout(getTenantByEmail(email));
            } else if (user_type === 'customer') {
                user = await withDbTimeout(getCustomerByEmail(email));
            } else if (user_type === 'admin') {
                user = await withDbTimeout(getAdminByEmail(email));
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

            // Try to send an image_url back to the frontend so UI can persist avatar even if DB schema differs
            const imageUrl = user.image_url ?? user.image ?? null;

            res.json({ token, user_type, name: user.name, image_url: imageUrl });
        } catch (err) {
            return next(err);
        }
    });

    router.post('/register', async (req, res, next) => {
        try {
            const { user_type, ...userData } = req.body;

            if (!user_type || !userData.email || !userData.password || !userData.name) {
                return next(new AppError('Missing registration fields', 400));
            }

            let result;
            if (user_type === 'tenant') {
                if (!String(userData.location || '').trim()) {
                    return next(new AppError('Tenant location is required', 400));
                }

                userData.password_hash = await hashPassword(userData.password);
                result = await withDbTimeout(createTenant(userData));
            } else if (user_type === 'customer') {
                userData.password_hash = await hashPassword(userData.password);
                result = await withDbTimeout(createCustomer(userData));
            } else if (user_type === 'admin') {
                userData.password_hash = await hashPassword(userData.password);
                result = await withDbTimeout(createAdmin(userData));
            } else {
                return next(new AppError('Invalid user type', 400));
            }

            res.status(201).json({ message: `${user_type} created successfully`, id: result.id });
        } catch (err) {
            return next(err);
        }
    });

    module.exports = router;
>>>>>>> Stashed changes
