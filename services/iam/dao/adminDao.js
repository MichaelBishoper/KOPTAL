const client = require('../db');

// Create
async function createAdmin(adminData) {
    const { name, email, phone, password_hash } = adminData;
    const result = await client.query(
        `INSERT INTO admins (name, email, phone, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [name, email, phone, password_hash]
    );
    return result.rows[0];
}

// Read
async function getAllAdmins() {
    const result = await client.query(
        `SELECT * FROM admins`
    );
    return result.rows;
}

async function getAdminById(id) {
    const result = await client.query(
        `SELECT * FROM admins WHERE manager_id = $1`, [id]
    );
    return result.rows[0];
}

async function getAdminByEmail(email) {
    const result = await client.query(
        `SELECT * FROM admins WHERE email = $1`, [email]
    );
    return result.rows[0];
}

// Update
async function updateAdmin(id, adminData) {
    const { name, email, phone } = adminData;
    const result = await client.query(
        `UPDATE admins
         SET name = $1, email = $2, phone = $3
         WHERE manager_id = $4
         RETURNING *`,
        [name, email, phone, id]
    );
    return result.rows[0];
}

async function updatePassword(adminId, newPasswordHash) {
    const result = await client.query(
        `UPDATE admins
         SET password_hash = $1
         WHERE manager_id = $2
         RETURNING manager_id, name, email`,
        [newPasswordHash, adminId]
    );
    return result.rows[0];
}

// Delete
async function deleteAdmin(id) {
    const result = await client.query(`DELETE FROM admins WHERE manager_id = $1 RETURNING *`, [id]);
    return result.rows[0];
}

module.exports = {
    createAdmin,
    getAllAdmins,
    getAdminById,
    getAdminByEmail,
    updateAdmin,
    updatePassword,
    deleteAdmin
};
