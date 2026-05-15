const client = require('../db')

// Create
async function createTenant(tenantData) {
    const { name, email, phone, password_hash, location, image_url } = tenantData;
    const result = await client.query(
        `INSERT INTO tenants (name, email, phone, password_hash, location, image_url)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`, [name, email, phone, password_hash, location ?? null, image_url ?? null]
    );
    return result.rows[0];
}

// Read
async function getAllTenants() {
    const result = await client.query(
        `SELECT * FROM tenants`
    );
    return result.rows;
}

async function getTenantById(id) {
    const result = await client.query(
        `SELECT * FROM tenants WHERE tenant_id = $1`, [id]
    );
    return result.rows[0];
}

async function getTenantByEmail(email) {
    const result = await client.query(
        'SELECT * FROM tenants WHERE email = $1', [email]
    );
    return result.rows[0];
}

// Update
async function updateTenant(id, tenantData) {
    const { name, email, phone, location, image_url } = tenantData;
    const result = await client.query(
        `UPDATE tenants
        SET name = $1, email = $2, phone = $3, location = $4, image_url = $5
        WHERE tenant_id = $6
        RETURNING *`, [name, email, phone, location ?? null, image_url ?? null, id]
    );
    return result.rows[0]; 
}

async function updatePassword(tenantId, newPasswordHash) {
    const result = await client.query(
        `UPDATE tenants 
        SET password_hash = $1
        WHERE tenant_id = $2 
        RETURNING tenant_id, name, email`, [newPasswordHash, tenantId]
    );
    return result.rows[0];
}

async function updateVerfied(tenant_id, newVerified) {
    const result = await client.query(
        `UPDATE tenants
        SET verified = $1
        WHERE tenant_id = $2
        RETURNING tenant_id, name, verified`, [tenant_id, newVerified]
    );
    return result.rows[0];
}

// Delete
async function deleteTenant(id) {
    const result = await client.query(
        'DELETE FROM tenants WHERE tenant_id = $1 RETURNING *', [id]
    );
    return result.rows[0];
}

module.exports = {
    createTenant,
    getAllTenants,
    getTenantById,
    getTenantByEmail,
    updateTenant,
    updatePassword,
    updateVerfied,
    deleteTenant
};

