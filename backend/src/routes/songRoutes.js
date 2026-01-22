const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');
const authMiddleware = require('../middleware/authMiddleware');
const { songUpload } = require('../middleware/audioUploadMiddleware');

// Subir canción (protegida, requiere auth)
router.post('/upload', 
  authMiddleware,
  songUpload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ]),
  songController.uploadSong
);

// Obtener todas las canciones (público)
router.get('/', songController.getSongs);

// Obtener canciones de un usuario (público)
router.get('/user/:userId', songController.getUserSongs);

// Incrementar reproducciones (público)
router.post('/:songId/play', songController.incrementPlays);

// Comentarios y likes (protegidos)
router.post('/:songId/comment', authMiddleware, songController.addComment);
router.post('/:songId/like', authMiddleware, songController.toggleLike);
router.get('/:songId/like', authMiddleware, songController.checkUserLike);

module.exports = router;