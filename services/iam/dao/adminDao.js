const client = require('../db');

// Create
async function createAdmin(adminData) {
    const { username, password_hash } = adminData;
    const result = await client.query(
        `INSERT INTO admins (username, password_hash)
         VALUES ($1, $2)
         RETURNING *`,
        [username, password_hash]
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

async function getAdminByUsername(username) {
    const result = await client.query(
        `SELECT * FROM admins WHERE username = $1`, [username]
    );
    return result.rows[0];
}

// Update
async function updateAdmin(id, adminData) {
    const { username } = adminData;
    const result = await client.query(
        `UPDATE admins
         SET username = $1
         WHERE manager_id = $2
         RETURNING *`,
        [username, id]
    );
    return result.rows[0];
}

async function updatePassword(adminId, newPasswordHash) {
    const result = await client.query(
        `UPDATE admins
         SET password_hash = $1
         WHERE manager_id = $2
         RETURNING manager_id, username`,
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
    getAdminByUsername,
    updateAdmin,
    updatePassword,
    deleteAdmin
};
