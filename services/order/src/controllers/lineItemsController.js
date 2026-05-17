const LineItem = require('../dao/lineItemsDao');
const PO = require('../dao/purchaseOrdersDao');
const { AppError } = require('../../middleware/errorHandler');

// Add line item to an order
async function addLineItem(req, res, next) {
    try {
        const { po_id, product_id, quantity, unit_price } = req.body;
        
        const order = await PO.getPurchaseOrderById(po_id);
        if (!order) {
            throw new AppError('Order not found', 404);
        }
        
        if (req.user.user_type !== 'customer' || order.customer_id !== req.user.user_id) {
            throw new AppError('You can only add items to your own orders', 403);
        }
        
        if (order.status !== 'draft') {
            throw new AppError('Cannot add items to an order that is not in draft status', 400);
        }
        
        const lineItem = await LineItem.addLineItem({ po_id, product_id, quantity, unit_price });
        
        // Update order totals
        const items = await LineItem.getLineItemsByOrderId(po_id);
        const subtotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
        const tax = subtotal * 0.08;
        const total = subtotal + tax;
        
        await PO.updateOrderTotals(po_id, subtotal, tax, total);
        
        res.status(201).json(lineItem);
    } catch (error) {
        next(error);
    }
}

// Get all line items for an order
async function getLineItems(req, res, next) {
    try {
        const { po_id } = req.params;
        
        const order = await PO.getPurchaseOrderById(po_id);
        if (!order) {
            throw new AppError('Order not found', 404);
        }
        
        // Check permission
        const isOwner = req.user.user_type === 'customer' && order.customer_id === req.user.user_id;
        const isTenant = req.user.user_type === 'tenant' && order.tenant_id === req.user.user_id;
        const isAdmin = req.user.user_type === 'admin';
        
        if (!isOwner && !isTenant && !isAdmin) {
            throw new AppError('Access denied', 403);
        }
        
        const items = await LineItem.getLineItemsByOrderId(po_id);
        res.json(items);
    } catch (error) {
        next(error);
    }
}

// Remove a line item
async function removeLineItem(req, res, next) {
    try {
        const { po_item_id } = req.params;
        
        const lineItem = await LineItem.getLineItemById(po_item_id);
        if (!lineItem) {
            throw new AppError('Line item not found', 404);
        }
        
        const order = await PO.getPurchaseOrderById(lineItem.po_id);
        
        if (req.user.user_type !== 'customer' || order.customer_id !== req.user.user_id) {
            throw new AppError('You can only remove items from your own orders', 403);
        }
        
        if (order.status !== 'draft') {
            throw new AppError('Cannot remove items from an order that is not in draft status', 400);
        }
        
        await LineItem.removeLineItem(po_item_id);
        
        // Update order totals
        const items = await LineItem.getLineItemsByOrderId(lineItem.po_id);
        const subtotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
        const tax = subtotal * 0.08;
        const total = subtotal + tax;
        
        await PO.updateOrderTotals(lineItem.po_id, subtotal, tax, total);
        
        res.json({ message: 'Line item removed successfully' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    addLineItem,
    getLineItems,
    removeLineItem
};
