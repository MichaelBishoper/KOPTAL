const pool = require('../config/db');

const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:4001';

async function fetchFromInventory(path, options = {}) {
    const url = `${INVENTORY_SERVICE_URL}${path}`;
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const error = new Error(errJson.error || `Inventory service returned ${res.status}`);
        error.statusCode = res.status;
        throw error;
    }
    return res.json();
}

// Create
async function addLineItem(data) {
    const { po_id, product_id, quantity, unit_price } = data;
    const numericQuantity = Number(quantity);
    if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
        const error = new Error('Quantity must be greater than zero');
        error.statusCode = 400;
        throw error;
    }

    // 1. Fetch product to see if it exists and has enough stock
    let product;
    try {
        const prodRes = await fetchFromInventory(`/api/products/${product_id}`);
        product = prodRes.data;
    } catch (err) {
        const error = new Error(err.message || 'Product not found');
        error.statusCode = err.statusCode || 404;
        throw error;
    }

    if (!product) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
    }

    const availableQuantity = Number(product.quantity);
    if (!Number.isFinite(availableQuantity) || availableQuantity < numericQuantity) {
        const error = new Error('Insufficient product availability');
        error.statusCode = 400;
        throw error;
    }

    // 2. Decrement stock in Inventory service
    try {
        await fetchFromInventory(`/api/products/${product_id}/decrement`, {
            method: 'PUT',
            body: JSON.stringify({ quantity: numericQuantity })
        });
    } catch (err) {
        const error = new Error(err.message || 'Failed to decrement stock');
        error.statusCode = err.statusCode || 400;
        throw error;
    }

    // 3. Insert line item in local order DB
    try {
        const result = await pool.query(
            `INSERT INTO po_line_items (po_id, product_id, quantity, unit_price)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [po_id, product_id, numericQuantity, unit_price]
        );
        return result.rows[0];
    } catch (error) {
        // Rollback stock decrement in inventory if local DB insert fails
        await fetchFromInventory(`/api/products/${product_id}/increment`, {
            method: 'PUT',
            body: JSON.stringify({ quantity: numericQuantity })
        }).catch((e) => console.error('Failed to rollback inventory stock decrement:', e.message));
        throw error;
    }
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
    // 1. Fetch line item first
    const lineItem = await getLineItemById(po_item_id);
    if (!lineItem) {
        return undefined;
    }

    // 2. Delete locally
    await pool.query(
        `DELETE FROM po_line_items WHERE po_item_id = $1`,
        [po_item_id]
    );

    // 3. Increment stock in Inventory service
    await fetchFromInventory(`/api/products/${lineItem.product_id}/increment`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: Number(lineItem.quantity) })
    }).catch((e) => console.error('Failed to restock inventory:', e.message));

    return lineItem;
}

async function clearLineItemsByOrderId(po_id) {
    const result = await pool.query(
        `DELETE FROM po_line_items WHERE po_id = $1 RETURNING *`,
        [po_id]
    );
    return result.rows;
}

async function restockLineItemsByOrderId(po_id) {
    const items = await getLineItemsByOrderId(po_id);
    if (!items || items.length === 0) return [];

    const results = [];
    for (const item of items) {
        try {
            const qty = Number(item.quantity);
            const prodRes = await fetchFromInventory(`/api/products/${item.product_id}/increment`, {
                method: 'PUT',
                body: JSON.stringify({ quantity: qty })
            });
            results.push(prodRes.data);
        } catch (e) {
            console.error(`Failed to restock product ${item.product_id} in inventory:`, e.message);
        }
    }
    return results;
}

module.exports = {
    addLineItem,
    getLineItemsByOrderId,
    getLineItemById,
    removeLineItem,
    clearLineItemsByOrderId,
    restockLineItemsByOrderId
};
