const express     = require('express');
const cors        = require('cors');
const path        = require('path');
const swaggerUi   = require('swagger-ui-express');
const swaggerFile = require('./swagger.json');

require('./models');

const app = express();

// middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// imagens carregadas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// documentação da api
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// rotas
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/tweets',       require('./routes/tweets'));
app.use('/api/utilizadores', require('./routes/utilizadores'));
app.use('/api/admin',        require('./routes/admin'));

// raiz
app.get('/', (req, res) => {
  res.json({ message: 'Twitter Clone API', status: 'online', docs: '/api-docs' });
});

// erros
app.use((err, req, res, next) => {
  if (err.message?.includes('Apenas imagens'))
    return res.status(400).json({ error: err.message });
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

module.exports = app;
