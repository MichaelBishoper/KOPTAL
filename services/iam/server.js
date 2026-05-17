// IAM Application Server
const { errorHandler } = require('./middleware/errorHandler');
const express = require('express');
const client = require('./db');
// For Swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routers/authRoute');
const publicRoutes = require('./routers/publicRoutes');
const tenantRoutes = require('./routers/tenantRoutes');
const customerRoutes = require('./routers/customerRoutes');
const adminRoutes = require('./routers/adminRoutes');

const app = express();
const casiopea = process.env.PORT || 3000;

// Swagger definition
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'IAM Service', 
            version: '1.0.0',
            description: 'Identity Access Management Server for KOPTAL',
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
    apis: ['./routers/*.js'], 
};

// Swagger endpoint
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());

// Public
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
// Private
app.use('/api/tenants', tenantRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/admins', adminRoutes);

// Debug route
app.get('/debug', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Error handler
app.use(errorHandler);

app.listen(casiopea, () => {
    console.log(`Server running on port ${casiopea}`);
});