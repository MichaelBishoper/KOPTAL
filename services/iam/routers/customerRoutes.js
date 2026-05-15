const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getCustomerById, updateCustomer, updatePassword } = require('../dao/customerDao');
const { comparePassword, hashPassword } = require('../utils/hashPasswords');
const { AppError } = require('../middleware/errorHandler');

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