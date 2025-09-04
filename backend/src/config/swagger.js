const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

// Swagger (OpenAPI 3.0) configuration for API docs
const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'Tasks + RBAC (JWT via cookie)'
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      // Cookie-based auth scheme: expects cookie named `token`
      securitySchemes: {
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'token' }
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'OK' },
            data:    { type: 'object', nullable: true, example: null },
            error:   { nullable: true, example: null }
          }
        },
        UserPublic: {
          type: 'object',
          properties: {
            username: { type: 'string', example: 'u1' },
            role:     { type: 'string', example: 'user' }
          }
        },
        LoginData: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOi...' }
          }
        },
        Task: {
          type: 'object',
          properties: {
            id:       { type: 'integer', example: 1 },
            title:    { type: 'string',  example: 't1' },
            content:  { type: 'string',  example: 'by user' },
            dueDate:  { type: 'integer', example: 4070908800000 },
            priority: { type: 'string',  example: 'LOW' },
            status:   { type: 'string',  example: 'PENDING' },
            owner:    { type: 'string',  example: '68b6e97c40d9277cb0e3e00b' }
          }
        },
        TaskWrapper: {
          type: 'object',
          properties: { task: { $ref: '#/components/schemas/Task' } }
        },
        TaskList: {
          type: 'object',
          properties: {
            tasks: { type: 'array', items: { $ref: '#/components/schemas/Task' } }
          }
        },
        Count: {
          type: 'object',
          properties: { count: { type: 'integer', example: 3 } }
        }
      },
      parameters: {
        StatusParam: {
          in: 'query', name: 'status',
          schema: { type: 'string', example: 'ALL' }
        },
        SortByParam: {
          in: 'query', name: 'sortBy',
          schema: { type: 'string', example: 'id' }
        },
        IdParam: {
          in: 'query', name: 'id',
          schema: { type: 'integer', example: 1 }, required: true
        },
        NewStatusParam: {
          in: 'query', name: 'status',
          schema: { type: 'string', example: 'PENDING' }, required: true
        },
        NewPriorityParam: {
          in: 'query', name: 'priority',
          schema: { type: 'string', example: 'HIGH' }, required: true
        }
      }
    },
    security: [{ cookieAuth: [] }]
  },
  // Absolute path to the API route files with OpenAPI annotations
  apis: [path.join(__dirname, '../routes/*.routes.js')]
};

module.exports = swaggerJSDoc(options);
