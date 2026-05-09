const pool = require('../config/db');

async function getAllUnits() {
  const res = await pool.query('SELECT unit_id, unit_name, unit_symbol, unit_type FROM units ORDER BY unit_id');
  return res.rows;
}

async function getUnitById(id) {
  const res = await pool.query('SELECT unit_id, unit_name, unit_symbol, unit_type FROM units WHERE unit_id = $1', [id]);
  return res.rows[0];
}

async function createUnit({ unit_name, unit_symbol, unit_type }) {
  const res = await pool.query(
    'INSERT INTO units (unit_name, unit_symbol, unit_type) VALUES ($1, $2, $3) RETURNING unit_id, unit_name, unit_symbol, unit_type',
    [unit_name, unit_symbol, unit_type]
  );
  return res.rows[0];
}

async function updateUnit(id, { unit_name, unit_symbol, unit_type }) {
  const res = await pool.query(
    'UPDATE units SET unit_name = $1, unit_symbol = $2, unit_type = $3 WHERE unit_id = $4 RETURNING unit_id, unit_name, unit_symbol, unit_type',
    [unit_name, unit_symbol, unit_type, id]
  );
  return res.rows[0];
}

async function deleteUnit(id) {
  await pool.query('DELETE FROM units WHERE unit_id = $1', [id]);
}

module.exports = {
  getAllUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
};
