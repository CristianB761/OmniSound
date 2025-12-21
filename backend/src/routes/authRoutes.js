const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta para enviar código de verificación
router.post('/send-code', authController.sendCode);

// Ruta para verificar código
router.post('/verify-code', authController.verifyCode);

// Ruta para registrar usuario
router.post('/register', authController.register);

module.exports = router;