require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

// CORS — allow the Next.js frontend to call this service.
const ALLOWED_ORIGINS = (process.env.FRONTEND_URL ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin ?? '';
  const isDev = process.env.NODE_ENV !== 'production';
  const isAllowed = isDev
    ? /^https?:\/\/localhost(:\d+)?$/.test(origin)
    : ALLOWED_ORIGINS.includes(origin);

  if (isAllowed) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// middleware
app.use(express.json());

// routes
const unitsRoutes         = require('./src/routes/unitsRoutes');
const productsRoutes      = require('./src/routes/tenantProductsRoutes');
const tenantsRoutes       = require('./src/routes/tenantsRoutes');
const customersRoutes     = require('./src/routes/customersRoutes');
const adminsRoutes        = require('./src/routes/adminsRoutes');
const purchaseOrdersRoutes = require('./src/routes/purchaseOrdersRoutes');

app.use('/api/units', unitsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/admins', adminsRoutes);
app.use('/api/purchase-orders', purchaseOrdersRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

// error handler (centralized)
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

if (require.main === module) {
  app.listen(port, () => console.log(`Monolith listening on ${port}`));
}

module.exports = app;
