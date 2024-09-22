const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Music Recommender System API',
            version: '1.0.0',
            description: 'API documentation for the Music Recommender System',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local server',
            },
            {
                url: 'https://music-recommendation-vyd9.onrender.com',
                description: 'Production server',
            },
        ],
    },
    apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;