// swagger.js — Geração automática da documentação Swagger
// Executa: node swagger.js
const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Twitter Clone API',
    description: 'API RESTful para clone do Twitter/X — DWBE 2025/2026',
    version: '1.0.0'
  },
  host: 'localhost:5000',
  basePath: '/',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'JWT token no formato: Bearer <token>'
    }
  },
  tags: [
    { name: 'Auth',        description: 'Autenticação (registo, login, logout)' },
    { name: 'Tweets',      description: 'Operações sobre tweets' },
    { name: 'Comentários', description: 'Comentários em tweets' },
    { name: 'Utilizadores',description: 'Perfis e seguimentos' },
    { name: 'Admin',       description: 'Backoffice (apenas administradores)' }
  ]
};

const outputFile   = './swagger.json';
const endpointsFiles = [
  './routes/auth.js',
  './routes/tweets.js',
  './routes/utilizadores.js',
  './routes/admin.js'
];

swaggerAutogen(outputFile, endpointsFiles, doc);
