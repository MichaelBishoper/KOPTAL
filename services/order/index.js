require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 4002;

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

app.use(express.json());

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Order Service',
            version: '1.0.0',
            description: 'Purchase Order and Line Items Service for KOPTAL',
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

const purchaseOrdersRoutes = require('./src/routes/purchaseOrdersRoutes');
const lineItemsRoutes = require('./src/routes/lineItemsRoutes');

app.use('/api/purchaseOrders', purchaseOrdersRoutes);
app.use('/api/lineItems', lineItemsRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

if (require.main === module) {
  app.listen(port, () => console.log(`Order Service listening on ${port}`));
}

module.exports = app;
