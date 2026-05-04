import swaggerJsdoc from 'swagger-jsdoc';
import { config } from '../config/env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Clinic Management System API',
      version: '1.0.0',
      description: 'Production-ready REST API for Clinic Management System',
      contact: { name: 'API Support', email: 'support@clinic.com' },
    },
    servers: [
      { url: `http://localhost:${config.PORT}`, description: 'Development' },
      { url: 'https://your-app.railway.app', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                data: { type: 'array', items: {} },
                pagination: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    totalPages: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication & Authorization' },
      { name: 'Users', description: 'User management' },
      { name: 'Appointments', description: 'Appointment scheduling' },
      { name: 'Medical Records', description: 'Patient medical history' },
      { name: 'Prescriptions', description: 'Doctor prescriptions' },
      { name: 'Payments', description: 'Payment processing' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
