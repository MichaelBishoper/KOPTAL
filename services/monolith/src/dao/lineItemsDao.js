const pool = require('../config/db');

// Create
async function addLineItem(data) {
    const { po_id, product_id, quantity, unit_price } = data;
    const result = await pool.query(
        `INSERT INTO po_line_items (po_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [po_id, product_id, quantity, unit_price]
    );
    return result.rows[0];
}

// Read
async function getLineItemsByOrderId(po_id) {
    const result = await pool.query(
        `SELECT * FROM po_line_items WHERE po_id = $1`,
        [po_id]
    );
    return result.rows;
}

async function getLineItemById(po_item_id) {
    const result = await pool.query(
        `SELECT * FROM po_line_items WHERE po_item_id = $1`,
        [po_item_id]
    );
    return result.rows[0];
}

// Delete
async function removeLineItem(po_item_id) {
    const result = await pool.query(
        `DELETE FROM po_line_items WHERE po_item_id = $1 RETURNING *`,
        [po_item_id]
    );
    return result.rows[0];
}

async function clearLineItemsByOrderId(po_id) {
    const result = await pool.query(
        `DELETE FROM po_line_items WHERE po_id = $1 RETURNING *`,
        [po_id]
    );
    return result.rows;
}

module.exports = {
    addLineItem,
    getLineItemsByOrderId,
    getLineItemById,
    removeLineItem,
    clearLineItemsByOrderId
};