import dotenv from 'dotenv';
// Cargar variables de entorno
dotenv.config();
import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StoreNetGames API',
      version: '1.0.0',
      description: 'Documentación de la API de StoreNetGames',
    },
    servers: [
      {
        url: `http://localhost:${process.env['PORT'] || 3000}/api`,
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options); 