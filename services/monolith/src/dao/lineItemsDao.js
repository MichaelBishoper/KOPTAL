const pool = require('../config/db');

// Create
async function addLineItem(data) {
    const { po_id, product_id, quantity, unit_price } = data;
    const numericQuantity = Number(quantity);
    if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
        const error = new Error('Quantity must be greater than zero');
        error.statusCode = 400;
        throw error;
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const stockResult = await client.query(
            `SELECT quantity FROM tenant_products WHERE product_id = $1 FOR UPDATE`,
            [product_id]
        );

        if (stockResult.rows.length === 0) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }

        const availableQuantity = Number(stockResult.rows[0].quantity);
        if (!Number.isFinite(availableQuantity) || availableQuantity < numericQuantity) {
            const error = new Error('Insufficient product availability');
            error.statusCode = 400;
            throw error;
        }

        await client.query(
            `UPDATE tenant_products
             SET quantity = quantity - $1
             WHERE product_id = $2`,
            [numericQuantity, product_id]
        );

        const result = await client.query(
            `INSERT INTO po_line_items (po_id, product_id, quantity, unit_price)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [po_id, product_id, numericQuantity, unit_price]
        );

        await client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
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
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const existingResult = await client.query(
            `SELECT * FROM po_line_items WHERE po_item_id = $1 FOR UPDATE`,
            [po_item_id]
        );

        if (existingResult.rows.length === 0) {
            await client.query('COMMIT');
            return undefined;
        }

        const lineItem = existingResult.rows[0];

        await client.query(
            `DELETE FROM po_line_items WHERE po_item_id = $1`,
            [po_item_id]
        );

        await client.query(
            `UPDATE tenant_products
             SET quantity = quantity + $1
             WHERE product_id = $2`,
            [lineItem.quantity, lineItem.product_id]
        );

        await client.query('COMMIT');
        return lineItem;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function clearLineItemsByOrderId(po_id) {
    const result = await pool.query(
        `DELETE FROM po_line_items WHERE po_id = $1 RETURNING *`,
        [po_id]
    );
    return result.rows;
}

async function restockLineItemsByOrderId(po_id, dbClient = pool) {
    const result = await dbClient.query(
        `WITH aggregated AS (
            SELECT product_id, SUM(quantity)::integer AS quantity_to_add
            FROM po_line_items
            WHERE po_id = $1
            GROUP BY product_id
        )
        UPDATE tenant_products tp
        SET quantity = tp.quantity + aggregated.quantity_to_add
        FROM aggregated
        WHERE tp.product_id = aggregated.product_id
        RETURNING tp.product_id, tp.quantity`,
        [po_id]
    );

    return result.rows;
}

module.exports = {
    addLineItem,
    getLineItemsByOrderId,
    getLineItemById,
    removeLineItem,
    clearLineItemsByOrderId,
    restockLineItemsByOrderId
};