// Database Connection Code
const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
    statement_timeout: 8000,
})

pool.on('connect', () => console.log("Connected to PostgreSQL"))
pool.on('error', (err) => console.error("DB pool error:", err.message))

module.exports = pool