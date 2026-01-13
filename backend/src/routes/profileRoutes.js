const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Ruta para obtener perfil por username (público)
router.get('/:username', profileController.getProfileByUsername);

// Ruta para obtener perfil del usuario autenticado (protegido)
router.get('/', authMiddleware, profileController.getMyProfile);

// Ruta para actualizar perfil del usuario autenticado (protegido)
router.put('/', authMiddleware, profileController.updateProfile);

// Ruta para subir foto de perfil (protegido)
router.post('/upload-picture', authMiddleware, upload.single('profile_picture'), profileController.uploadProfilePicture);

module.exports = router;