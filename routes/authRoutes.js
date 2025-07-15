const express = require('express');
const { getLogin, getRegister, login, register, logout } = require('../controllers/authController');
const authRouter = express.Router();

authRouter.get('/login', getLogin)

authRouter.get('/register', getRegister)

authRouter.post('/login', login)

authRouter.post('/register', register)

authRouter.get('/logout', logout)

module.exports = authRouter;