const PO = require('../dao/purchaseOrdersDao');
const LineItem = require('../dao/lineItemsDao');
const { AppError } = require('../../middleware/errorHandler');

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
        if (req.user.user_type !== 'tenant') {
            throw new AppError('Only tenants can update order status', 403);
        }
        
        const order = await PO.getPurchaseOrderById(req.params.id);
        
        if (!order) {
            throw new AppError('Order not found', 404);
        }
        
        if (order.tenant_id !== req.user.user_id) {
            throw new AppError('This order belongs to another tenant', 403);
        }
        
        const updated = await PO.updateOrderStatus(req.params.id, req.body.status);
        res.json(updated);
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