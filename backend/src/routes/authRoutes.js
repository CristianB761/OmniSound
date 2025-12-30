const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta para enviar código
router.post('/send-code', authController.sendCode);

// Ruta para verificar código
router.post('/verify-code', authController.verifyCode);

// Ruta para crear cuenta
router.post('/signup', authController.signup);

// Ruta para iniciar sesión
router.post('/signin', authController.signin);

module.exports = router;