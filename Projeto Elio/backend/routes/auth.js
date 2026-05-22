// rotas de autenticação
const express = require('express');
const router  = express.Router();
const { register, login, logout } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// #swagger.tags = ['Auth']

// #swagger.summary = 'Registar novo utilizador'
router.post('/register', register);

// #swagger.summary = 'Login de utilizador'
router.post('/login', login);

// #swagger.summary = 'Logout do utilizador autenticado'
router.post('/logout', authMiddleware, logout);

module.exports = router;
