require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(express.json());

// routes
const unitsRoutes = require('./src/routes/unitsRoutes');
const productsRoutes = require('./src/routes/tenantProductsRoutes');

app.use('/api/units', unitsRoutes);
app.use('/api/products', productsRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

// error handler (centralized)
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

if (require.main === module) {
  app.listen(port, () => console.log(`Monolith listening on ${port}`));
}

module.exports = app;
