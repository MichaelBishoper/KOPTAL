const pool = require('../config/db');

async function getAllProducts() {
  const res = await pool.query(
    `SELECT p.product_id, p.tenant_id, p.name, p.quantity, p.unit_id, u.unit_name,
            p.price, p.category, p.description, p.image_url as image
     FROM tenant_products p
     LEFT JOIN units u ON p.unit_id = u.unit_id
     ORDER BY p.product_id`
  );
  return res.rows;
}

async function getProductById(id) {
  const res = await pool.query(
    `SELECT p.product_id, p.tenant_id, p.name, p.quantity, p.unit_id, u.unit_name,
            p.price, p.category, p.description, p.image_url as image
     FROM tenant_products p
     LEFT JOIN units u ON p.unit_id = u.unit_id
     WHERE p.product_id = $1`,
     [id]
  );
  return res.rows[0];
}

async function createProduct({ tenant_id, name, quantity, unit_id, price, category, description, image, image_url }) {
  const normalizedImage = image_url ?? image ?? null;
  const res = await pool.query(
    `INSERT INTO tenant_products (tenant_id, name, quantity, unit_id, price, category, description, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING product_id, tenant_id, name, quantity, unit_id, price, category, description, image_url as image`,
    [tenant_id, name, quantity, unit_id, price, category ?? null, description ?? null, normalizedImage]
  );
  return res.rows[0];
}

async function updateProduct(id, { tenant_id, name, quantity, unit_id, price, category, description, image, image_url }) {
  const normalizedImage = image_url ?? image ?? null;
  const res = await pool.query(
    `UPDATE tenant_products
     SET tenant_id = $1,
         name = $2,
         quantity = $3,
         unit_id = $4,
         price = $5,
         category = $6,
         description = $7,
         image_url = $8
     WHERE product_id = $9
     RETURNING product_id, tenant_id, name, quantity, unit_id, price, category, description, image_url as image`,
    [tenant_id, name, quantity, unit_id, price, category ?? null, description ?? null, normalizedImage, id]
  );
  return res.rows[0];
}

async function deleteProduct(id) {
  await pool.query('DELETE FROM tenant_products WHERE product_id = $1', [id]);
}

async function decrementStock(id, qty) {
  const res = await pool.query(
    `UPDATE tenant_products
     SET quantity = quantity - $1
     WHERE product_id = $2 AND quantity >= $1
     RETURNING *`,
     [qty, id]
  );
  return res.rows[0];
}

async function incrementStock(id, qty) {
  const res = await pool.query(
    `UPDATE tenant_products
     SET quantity = quantity + $1
     WHERE product_id = $2
     RETURNING *`,
     [qty, id]
  );
  return res.rows[0];
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  decrementStock,
  incrementStock,
};
