require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Get along, get along Kid Charlemagne
// middleware
app.use(express.json());

// Swagger definition
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Monolith Service',
            version: '1.0.0',
            description: 'Product and Purchase Order Service for KOPTAL',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// routes
const unitsRoutes = require('./src/routes/unitsRoutes');
const productsRoutes = require('./src/routes/tenantProductsRoutes');
const purchaseOrdersRoutes = require('./src/routes/purchaseOrdersRoutes');
const lineItemsRoutes = require('./src/routes/lineItemsRoutes');
const adminSettingsRoutes = require('./src/routes/adminSettingsRoutes');

app.use('/api/units', unitsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/purchaseOrders', purchaseOrdersRoutes);
app.use('/api/lineItems', lineItemsRoutes);
app.use('/api/admin', adminSettingsRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

// error handler (centralized)
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

if (require.main === module) {
  app.listen(port, () => console.log(`Monolith listening on ${port}`));
}

module.exports = app;
