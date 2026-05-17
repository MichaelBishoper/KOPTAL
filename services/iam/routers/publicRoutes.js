// PUBLIC ROUTES
const express = require('express');
const router = express.Router();
const { getAllTenants } = require('../dao/tenantDao');
const { getAllCustomers } = require('../dao/customerDao');

/**
 * @swagger
 * /public/tenants:
 *   get:
 *     summary: Get all tenants (public)
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: List of all tenants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   tenant_id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   verified:
 *                     type: boolean
 *                   location:
 *                     type: string
 *                   image_url:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 */

// Get all tenants
router.get('/tenants', async (req, res, next) => {
    try {
        const tenants = await getAllTenants();
    
        const safeTenants = tenants.map(t => ({
            tenant_id: t.tenant_id,
            name: t.name,
            verified: t.verified,
            location: t.location,
            image_url: t.image_url,
            created_at: t.created_at,
        }));
        
        res.json(safeTenants);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /public/customers:
 *   get:
 *     summary: Get all customers (public)
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: List of all customers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   customer_id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   company:
 *                     type: string
 *                   image_url:
 *                     type: string
 */

// Get all customers
router.get('/customers', async (req, res, next) => {
    try {
        const customers = await getAllCustomers();
        
        const safeCustomers = customers.map(c => ({
            customer_id: c.customer_id,
            name: c.name,
            company: c.company,
            image_url: c.image_url ?? null,
        }));
        
        res.json(safeCustomers);
    } catch (error) {
        next(error);
    }
});

module.exports = router;