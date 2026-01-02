const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta para obtener perfil por username (público)
router.get('/:username', profileController.getProfileByUsername);

// Ruta para obtener perfil del usuario autenticado (protegido)
router.get('/', authMiddleware, profileController.getMyProfile);

module.exports = router;