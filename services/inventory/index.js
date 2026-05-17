require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 4001;

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

app.use(express.json());

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Inventory Service',
            version: '1.0.0',
            description: 'Product and Units Inventory Service for KOPTAL',
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

const unitsRoutes = require('./src/routes/unitsRoutes');
const productsRoutes = require('./src/routes/tenantProductsRoutes');

app.use('/api/units', unitsRoutes);
app.use('/api/products', productsRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

if (require.main === module) {
  app.listen(port, () => console.log(`Inventory Service listening on ${port}`));
}

module.exports = app;
