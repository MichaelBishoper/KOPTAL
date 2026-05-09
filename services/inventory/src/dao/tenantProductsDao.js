const pool = require('../config/db');

async function getAllProducts() {
  const res = await pool.query(
    `SELECT p.product_id, p.tenant_id, t.name as tenant_name, p.name, p.quantity, p.unit_id, u.unit_name, p.price
     FROM tenant_products p
     LEFT JOIN tenants t ON p.tenant_id = t.tenant_id
     LEFT JOIN units u ON p.unit_id = u.unit_id
     ORDER BY p.product_id`
  );
  return res.rows;
}

async function getProductById(id) {
  const res = await pool.query(
    `SELECT p.product_id, p.tenant_id, t.name as tenant_name, p.name, p.quantity, p.unit_id, u.unit_name, p.price
     FROM tenant_products p
     LEFT JOIN tenants t ON p.tenant_id = t.tenant_id
     LEFT JOIN units u ON p.unit_id = u.unit_id
     WHERE p.product_id = $1`,
    [id]
  );
  return res.rows[0];
}

async function createProduct({ tenant_id, name, quantity, unit_id, price }) {
  const res = await pool.query(
    'INSERT INTO tenant_products (tenant_id, name, quantity, unit_id, price) VALUES ($1, $2, $3, $4, $5) RETURNING product_id, tenant_id, name, quantity, unit_id, price',
    [tenant_id, name, quantity, unit_id, price]
  );
  return res.rows[0];
}

async function updateProduct(id, { tenant_id, name, quantity, unit_id, price }) {
  const res = await pool.query(
    'UPDATE tenant_products SET tenant_id = $1, name = $2, quantity = $3, unit_id = $4, price = $5 WHERE product_id = $6 RETURNING product_id, tenant_id, name, quantity, unit_id, price',
    [tenant_id, name, quantity, unit_id, price, id]
  );
  return res.rows[0];
}

async function deleteProduct(id) {
  await pool.query('DELETE FROM tenant_products WHERE product_id = $1', [id]);
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
