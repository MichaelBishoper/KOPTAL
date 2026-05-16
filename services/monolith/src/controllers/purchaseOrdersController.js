const PO = require('../dao/purchaseOrdersDao');
const LineItem = require('../dao/lineItemsDao');
const { AppError } = require('../../middleware/errorHandler');
const pool = require('../config/db');

// Create purchase order
async function createPurchaseOrder(req, res, next) {
    try {
        if (req.user.user_type !== 'customer') {
            throw new AppError('Only customers can create purchase orders', 403);
        }
        
        const poData = {
            po_number: `PO-${Date.now()}`,
            customer_id: req.user.user_id,
            tenant_id: req.body.tenant_id,
            shipping_address: req.body.shipping_address,
            notes: req.body.notes
        };
        
        const po = await PO.createPurchaseOrder(poData);
        res.status(201).json(po);
    } catch (error) {
        next(error);
    }
}

// Get order by ID
async function getOrderById(req, res, next) {
    try {
        const order = await PO.getPurchaseOrderById(req.params.id);
        
        if (!order) {
            throw new AppError('Order not found', 404);
        }
        
        // Check if user owns this order or is tenant/admin
        if (req.user.user_type === 'customer' && order.customer_id !== req.user.user_id) {
            throw new AppError('Access denied', 403);
        }
        
        if (req.user.user_type === 'tenant' && order.tenant_id !== req.user.user_id) {
            throw new AppError('Access denied', 403);
        }
        
        const lineItems = await LineItem.getLineItemsByOrderId(req.params.id);
        
        res.json({ ...order, items: lineItems });
    } catch (error) {
        next(error);
    }
}

// Get customer's own orders
async function getMyOrders(req, res, next) {
    try {
        if (req.user.user_type !== 'customer') {
            throw new AppError('Access denied', 403);
        }
        
        const orders = await PO.getPurchaseOrdersByCustomer(req.user.user_id);
        res.json(orders);
    } catch (error) {
        next(error);
    }
}

// Get tenant's incoming orders
async function getTenantOrders(req, res, next) {
    try {
        if (req.user.user_type !== 'tenant') {
            throw new AppError('Access denied', 403);
        }
        
        const orders = await PO.getPurchaseOrdersByTenant(req.user.user_id);
        res.json(orders);
    } catch (error) {
        next(error);
    }
}

// Update order status (tenant only)
async function updateOrderStatus(req, res, next) {
    try {
        const order = await PO.getPurchaseOrderById(req.params.id);
        
        if (!order) {
            throw new AppError('Order not found', 404);
        }

        const requestedStatus = String(req.body.status || '').toLowerCase();
        if (!requestedStatus) {
            throw new AppError('Status is required', 400);
        }

        const currentStatus = String(order.status || '').toLowerCase();

        if (req.user.user_type === 'tenant') {
            if (order.tenant_id !== req.user.user_id) {
                throw new AppError('This order belongs to another tenant', 403);
            }

            if (!['shipped', 'cancelled', 'confirmed'].includes(requestedStatus)) {
                throw new AppError('Tenants can only set status to shipped, confirmed, or cancelled', 400);
            }

            if (String(order.status).toLowerCase() === 'delivered') {
                throw new AppError('Delivered order is locked', 400);
            }

            if (currentStatus === 'cancelled') {
                throw new AppError('Cancelled order is already locked', 400);
            }
        } else if (req.user.user_type === 'customer') {
            if (order.customer_id !== req.user.user_id) {
                throw new AppError('This order belongs to another customer', 403);
            }

            if (requestedStatus !== 'delivered') {
                throw new AppError('Customers can only set status to delivered', 400);
            }

            if (currentStatus === 'cancelled') {
                throw new AppError('Cancelled order cannot be marked delivered', 400);
            }

            if (currentStatus === 'delivered') {
                throw new AppError('Order is already delivered', 400);
            }
        } else {
            throw new AppError('Only tenants or customers can update order status', 403);
        }

        const shouldRestock = req.user.user_type === 'tenant' && requestedStatus === 'cancelled' && currentStatus !== 'cancelled';

        if (!shouldRestock) {
            const updated = await PO.updateOrderStatus(req.params.id, requestedStatus);
            res.json(updated);
            return;
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await LineItem.restockLineItemsByOrderId(order.po_id, client);
            const updated = await PO.updateOrderStatus(req.params.id, requestedStatus, client);

            await client.query('COMMIT');
            res.json(updated);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createPurchaseOrder,
    getOrderById,
    getMyOrders,
    getTenantOrders,
    updateOrderStatus
};