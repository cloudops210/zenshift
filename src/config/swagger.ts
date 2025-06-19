import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Zenshift API',
        version: '1.0.0',
        description: 'API documentation for Zenshift backend',
    },
    servers: [
        {
            url: 'http://localhost:5000',
            description: 'Development server',
        },
    ],
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
};

const options = {
    swaggerDefinition,
    apis: [
        './src/api/**/*.ts',
        './src/models/*.ts',
    ],
};

export default swaggerJSDoc(options);
