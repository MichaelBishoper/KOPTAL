const client = require('../db');

// Create
async function createAdmin(adminData) {
    const { name, email, phone, cooperative_id_number, password_hash } = adminData;
    const result = await client.query(
        `INSERT INTO admins (name, email, phone, cooperative_id_number, password_hash)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [name, email, phone, cooperative_id_number, password_hash]
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
    const { name, email, phone, cooperative_id_number, image_url, image } = adminData;
    const normalizedImage = image_url ?? image ?? null;
    const result = await client.query(
        `UPDATE admins
         SET name = $1, email = $2, phone = $3, cooperative_id_number = $4,
             image_url = COALESCE($6, image_url)
         WHERE manager_id = $5
         RETURNING *`,
        [name, email, phone, cooperative_id_number, id, normalizedImage || null]
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
