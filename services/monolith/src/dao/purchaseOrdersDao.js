// daos/purchaseOrderDao.js
const pool = require('../config/db');

// Create
async function createPurchaseOrder(poData) {
    const { po_number, customer_id, tenant_id, shipping_address, notes } = poData;
    const result = await pool.query(
        `INSERT INTO purchase_orders (po_number, customer_id, tenant_id, shipping_address, notes)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [po_number, customer_id, tenant_id, shipping_address, notes]
    );
    return result.rows[0];
}

// Read
async function getPurchaseOrderById(po_id) {
    const result = await pool.query(`SELECT * FROM purchase_orders WHERE po_id = $1`, [po_id]);
    return result.rows[0];
}

async function getPurchaseOrdersByCustomer(customer_id) {
    const result = await pool.query(`SELECT * FROM purchase_orders WHERE customer_id = $1`, [customer_id]);
    return result.rows;
}

async function getPurchaseOrdersByTenant(tenant_id) {
    const result = await pool.query(`SELECT * FROM purchase_orders WHERE tenant_id = $1`, [tenant_id]);
    return result.rows;
}

// Update
async function updateOrderStatus(po_id, status) {
    const result = await pool.query(
        `UPDATE purchase_orders SET status = $1 WHERE po_id = $2 RETURNING *`,
        [status, po_id]
    );
    return result.rows[0];
}   

async function updateOrderTotals(po_id, subtotal, tax_amount, total_amount) {
    const result = await pool.query(
        `UPDATE purchase_orders SET subtotal = $1, tax_amount = $2, total_amount = $3 WHERE po_id = $4 RETURNING *`,
        [subtotal, tax_amount, total_amount, po_id]
    );
    return result.rows[0];
}

// Delete
async function deletePurchaseOrder(po_id) {
    const result = await pool.query(`DELETE FROM purchase_orders WHERE po_id = $1 RETURNING *`, [po_id]);
    return result.rows[0];
}

module.exports = {
    createPurchaseOrder,
    getPurchaseOrderById,
    getPurchaseOrdersByCustomer,
    getPurchaseOrdersByTenant,
    updateOrderStatus,
    updateOrderTotals,
    deletePurchaseOrder
};