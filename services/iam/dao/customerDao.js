const client = require('../db')

// Create
async function createCustomer(customerData) {
    const { name, email, phone, company, tax_id, billing_address, shipping_address, password_hash } = customerData;
    const result = await client.query(
        `INSERT INTO customers (name, email, phone, company, tax_id, billing_address, shipping_address, password_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`, [name, email, phone, company, tax_id, billing_address, shipping_address, password_hash ]
    );
    return result.rows[0];
}

// Read
async function getAllCustomers() {
    const result = await client.query(
        `SELECT * FROM customers`
    );
    return result.rows;
}

async function getCustomerById(id) {
    const result = await client.query(
        `SELECT * FROM customers WHERE customer_id = $1`, [id]
    );
    return result.rows[0];
}

async function getCustomerByEmail(email) {
    const result = await client.query(
        'SELECT * FROM customers WHERE email = $1', [email]
    );
    return result.rows[0];
}

// Update
async function updateCustomer(id, customerData) {
    const { name, email, phone, company, tax_id, billing_address, shipping_address } = customerData;
    const result = await client.query(
        `UPDATE customers
        SET name = $1, email = $2, phone = $3, company = $4, tax_id = $5, billing_address = $6, shipping_address = $7
        WHERE customer_id = $8
        RETURNING *`, [name, email, phone, company, tax_id, billing_address, shipping_address]
    );
    return result.rows[0]; 
}

async function updatePassword(id, newPasswordHash) {
    const result = await client.query(
        `UPDATE customers
        SET password_hash = $1
        WHERE customer_id = $2 
        RETURNING customer_id, name, email`, [newPasswordHash, id]
    );
    return result.rows[0];
}

// Delete
async function deleteCustomer(id) {
    const result = await client.query(
        'DELETE FROM customers WHERE customer_id = $1 RETURNING *', [id]
    );
    return result.rows[0];
}

module.exports = {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    getCustomerByEmail,
    updateCustomer,
    updatePassword,
    deleteCustomer
};