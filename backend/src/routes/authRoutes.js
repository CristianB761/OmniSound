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

// Ruta para enviar código de restablecimiento
router.post('/send-password-reset-code', authController.sendPasswordResetCode);

// Ruta para verificar código de restablecimiento
router.post('/verify-password-reset-code', authController.verifyPasswordResetCode);

// Ruta para restablecer contraseña
router.post('/reset-password', authController.resetPassword);

module.exports = router;