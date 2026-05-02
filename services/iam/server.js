// IAM Application Server
const express = require('express');
const client = require('./db');

const authRoutes = require('./routers/authRoute');
const tenantRoutes = require('./routers/tenantRoutes');

const app = express();
const casiopea = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);

// Debug route
app.get('/debug', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(casiopea, () => {
    console.log(`Server running on port ${casiopea}`);
});