const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PG_HOST || process.env.DB_HOST || 'localhost',
  port: process.env.PG_PORT || process.env.DB_PORT || 5432,
  user: process.env.PG_USER || process.env.DB_USER,
  password: process.env.PG_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.PG_DATABASE || process.env.DB_NAME,
});

pool.on('error', (err) => {
  console.error('[db pool] idle client error:', err.message);
});

module.exports = pool;
