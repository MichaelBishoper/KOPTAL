    // authentication routes (login and register)
    const express = require('express')
    const router = express.Router();
    const jwt = require('jsonwebtoken')
    const { verifyToken } = require('../middleware/auth');
    const { getTenantById, getTenantByEmail, createTenant, updateTenant, updatePassword: updateTenantPassword } = require('../dao/tenantDao');
    const { getCustomerById, getCustomerByEmail, createCustomer, updateCustomer, updatePassword: updateCustomerPassword } = require('../dao/customerDao');
    const { getAdminById, getAdminByUsername, createAdmin, updateAdmin, updatePassword: updateAdminPassword } = require('../dao/adminDao');
    const { comparePassword, hashPassword } = require('../utils/hashPasswords');
    const { AppError } = require('../middleware/errorHandler');

    const DB_TIMEOUT_MS = 6000;
    const withDbTimeout = (promise) =>
        Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new AppError('Database unavailable, please try again later', 503)), DB_TIMEOUT_MS)
            ),
        ]);
    
    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: Login user
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *               - user_type
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *               user_type:
     *                 type: string
     *                 enum: [tenant, customer, admin]
     *     responses:
     *       200:
     *         description: Login successful
     *       401:
     *         description: Invalid credentials
     */
    router.post('/login', async (req, res, next) => {
        try {
            const { email, username, password, user_type } = req.body;

            if (!password || !user_type) {
                return next(new AppError('Missing login fields', 400));
            }

            // Choose user based on role
            let user;
            if (user_type === 'tenant') {
                if (!email) return next(new AppError('Missing email', 400));
                user = await withDbTimeout(getTenantByEmail(email));
            } else if (user_type === 'customer') {
                if (!email) return next(new AppError('Missing email', 400));
                user = await withDbTimeout(getCustomerByEmail(email));
            } else if (user_type === 'admin') {
                if (!username) return next(new AppError('Missing username', 400));
                user = await withDbTimeout(getAdminByUsername(username));
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
                    email: user.email || user.username
                },
                process.env.JWT_SECRET
            );

            res.json({ token, user_type, name: user.name || user.username });
        } catch (err) {
            return next(err);
        }
    });
    
    /**
     * @swagger
     * /auth/register:
     *   post:
     *     summary: Register new user
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - user_type
     *               - name
     *               - email
     *               - phone
     *               - password
     *             properties:
     *               user_type:
     *                 type: string
     *                 enum: [tenant, customer]
     *               name:
     *                 type: string
     *               email:
     *                 type: string
     *               phone:
     *                 type: string
     *               password:
     *                 type: string
     *               company:
     *                 type: string
     *               tax_id:
     *                 type: string
     *               billing_address:
     *                 type: string
     *               shipping_address:
     *                 type: string
     *     responses:
     *       201:
     *         description: User created successfully
     */
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
                if (!String(userData.cooperative_id_number || '').trim()) {
                    return next(new AppError('Cooperative ID Number is required', 400));
                }

                userData.password_hash = await hashPassword(userData.password);
                result = await withDbTimeout(createTenant(userData));
            } else if (user_type === 'customer') {
                userData.password_hash = await hashPassword(userData.password);
                result = await withDbTimeout(createCustomer(userData));
            } else {
                return next(new AppError('Invalid user type', 400));
            }

            res.status(201).json({ message: `${user_type} created successfully`, id: result?.tenant_id || result?.customer_id });
        } catch (err) {
            return next(err);
        }
    });

    /**
     * @swagger
     * /auth/register-admin:
     *   post:
     *     summary: Register new admin (Protected)
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     */
    router.post('/register-admin', verifyToken, async (req, res, next) => {
        try {
            if (req.user.user_type !== 'admin') {
                return next(new AppError('Forbidden: Only admins can create new admins', 403));
            }

            const { username, password } = req.body;
            if (!username || !password) {
                return next(new AppError('Missing username or password', 400));
            }

            const password_hash = await hashPassword(password);
            const result = await withDbTimeout(createAdmin({ username, password_hash }));

            res.status(201).json({ message: 'Admin created successfully', manager_id: result.manager_id });
        } catch (err) {
            return next(err);
        }
    });
    
    /**
     * @swagger
     * /auth/change-password:
     *   post:
     *     summary: Change password for authenticated user
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - currentPassword
     *               - newPassword
     *             properties:
     *               currentPassword:
     *                 type: string
     *                 description: Current password of the user
     *                 example: "oldPassword123"
     *               newPassword:
     *                 type: string
     *                 description: New password to set
     *                 example: "newPassword456"
     *     responses:
     *       200:
     *         description: Password updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Password updated successfully"
     *       400:
     *         description: Missing password fields or invalid user type
     *       401:
     *         description: Current password is incorrect
     *       404:
     *         description: User not found
     */
    
    // Protected route to change password for an authenticated user
    router.post('/change-password', verifyToken, async (req, res, next) => {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return next(new AppError('Missing password fields', 400));
            }

            const { user_id, user_type } = req.user;

            // Load the user record depending on the role
            let user;
            if (user_type === 'tenant') {
                user = await withDbTimeout(getTenantById(user_id));
            } else if (user_type === 'customer') {
                user = await withDbTimeout(getCustomerById(user_id));
            } else if (user_type === 'admin') {
                user = await withDbTimeout(getAdminById(user_id));
            } else {
                return next(new AppError('Invalid user type', 400));
            }

            if (!user) {
                return next(new AppError('User not found', 404));
            }

            // Verify current password
            const matches = await comparePassword(currentPassword, user.password_hash);
            if (!matches) {
                return next(new AppError('Current password is incorrect', 401));
            }

            // Hash and update
            const hashed = await hashPassword(newPassword);
            if (user_type === 'tenant') {
                await withDbTimeout(updateTenantPassword(user_id, hashed));
            } else if (user_type === 'customer') {
                await withDbTimeout(updateCustomerPassword(user_id, hashed));
            } else if (user_type === 'admin') {
                await withDbTimeout(updateAdminPassword(user_id, hashed));
            }

            res.json({ message: 'Password updated successfully' });
        } catch (err) {
            return next(err);
        }
    });

    module.exports = router;