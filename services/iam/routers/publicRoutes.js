// PUBLIC ROUTES
const express = require('express');
const router = express.Router();
const { getAllTenants } = require('../dao/tenantDao');
const { getAllCustomers } = require('../dao/customerDao');

// Get
// Get all tenants
router.get('/tenants', async (req, res, next) => {
    try {
        const tenants = await getAllTenants();
    
        const safeTenants = tenants.map(t => ({
            tenant_id: t.tenant_id,
            name: t.name,
            verified: t.verified
        }));
        
        res.json(safeTenants);
    } catch (error) {
        next(error);
    }
});

// Get all customers
router.get('/customers', async (req, res, next) => {
    try {
        const customers = await getAllCustomers();
        
        const safeCustomers = customers.map(c => ({
            customer_id: c.customer_id,
            name: c.name,
            company: c.company
        }));
        
        res.json(safeCustomers);
    } catch (error) {
        next(error);
    }
});

module.exports = router;