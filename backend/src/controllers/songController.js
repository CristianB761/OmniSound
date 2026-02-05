const Song = require('../models/Song');
const { promisePool } = require('../config/database');
const fs = require('fs');
const path = require('path');

const songController = {
  // Subir nueva canción
  uploadSong: async (req, res) => {
    try {
      const userId = req.user.id;

      // Recibir todos los campos del formulario
      const { 
        title, 
        artist, 
        genre, 
        tags, 
        description, 
        privacy 
      } = req.body;

      if (!req.files || !req.files.audio) {
        return res.status(400).json({ error: 'Se requiere un archivo de audio' });
      }

      // Verificar campos requeridos
      if (!title || !artist) {
        return res.status(400).json({ error: 'Título y artista son requeridos' });
      }

      // Obtener URLs de los archivos subidos
      const audioUrl = `/uploads/audios/${req.files.audio[0].filename}`;
      let imageUrl = null;

      if (req.files.image && req.files.image[0]) {
        imageUrl = `/uploads/song-images/${req.files.image[0].filename}`;
      }

      // Calcular duración (puedes usar una librería como node-id3 más adelante)
      const duration = req.body.duration || 0;

      // Crear canción en la base de datos con todos los campos
      const result = await Song.create({
        userId,
        title,
        artist,
        genre: genre || null,
        audioUrl,
        imageUrl,
        duration,
        tags: tags || null,
        description: description || null,
        privacy: privacy || 'public'
      });

      console.log(`\n===================================`);
      console.log(`CANCIÓN SUBIDA`);
      console.log(`ID: ${result.insertId}`);
      console.log(`Usuario: ${userId}`);
      console.log(`Título: ${title}`);
      console.log(`Artista: ${artist}`);
      console.log(`Género: ${genre || 'No especificado'}`);
      console.log(`Tags: ${tags || 'Ninguno'}`);
      console.log(`Privacidad: ${privacy || 'public'}`);
      console.log(`Audio: ${audioUrl}`);
      console.log(`Imagen: ${imageUrl || 'Ninguna'}`);
      console.log(`===================================`);

      res.status(201).json({
        success: true,
        message: 'Canción subida exitosamente',
        song: {
          id: result.insertId,
          title,
          artist,
          genre,
          audioUrl,
          imageUrl,
          duration,
          tags,
          description,
          privacy
        }
      });

    } catch (error) {
      console.error('Error al subir canción:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener todas las canciones (para feed)
  getSongs: async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      
      const songs = await Song.findAll(parseInt(limit), parseInt(offset));

      // Formatear respuesta CON TIEMPO DINÁMICO Y HASHTAGS
      const formattedSongs = songs.map(song => {
        // ============ CÁLCULO DE TIEMPO TRANSCURRIDO (IGUAL QUE EN getUserSongs) ============
        const createdDate = new Date(song.created_at);
        const now = new Date();
        const diffTime = Math.abs(now - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let timeAgo = '';
        if (diffDays >= 365) {
          const years = Math.floor(diffDays / 365);
          timeAgo = `hace ${years} año${years > 1 ? 's' : ''}`;
        } else if (diffDays >= 30) {
          const months = Math.floor(diffDays / 30);
          timeAgo = `hace ${months} mes${months > 1 ? 'es' : ''}`;
        } else if (diffDays >= 1) {
          timeAgo = `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
        } else {
          const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
          if (diffHours > 0) {
            timeAgo = `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
          } else {
            timeAgo = 'hace unos momentos';
          }
        }

        // ============ HASHTAGS (IGUAL QUE ANTES) ============
        const hashtags = [];
        if (song.genre) {
          hashtags.push(`#${song.genre.toLowerCase().replace(/\s+/g, '')}`);
        }
        if (song.tags) {
          const tagsArray = song.tags.split(',').map(tag => tag.trim());
          tagsArray.forEach(tag => {
            if (tag) hashtags.push(`#${tag.toLowerCase().replace(/\s+/g, '')}`);
          });
        }

        // ============ FORMATEAR DURACIÓN ============
        const durationFormatted = `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}`;

        return {
          id: song.id,
          title: song.title,
          artist: song.username, // Usar username del usuario como artista
          genre: hashtags.join(' '), // Unir todos los hashtags
          timeAgo: timeAgo, // ← ¡AHORA ES DINÁMICO!
          duration: durationFormatted,
          likes: song.likes,
          reposts: song.reposts,
          comments: song.comments,
          plays: song.plays,
          audioUrl: song.audio_url,
          imageUrl: song.image_url,
          artistComments: [] // Por ahora vacío
        };
      });

      res.json({
        success: true,
        songs: formattedSongs
      });

    } catch (error) {
      console.error('Error al obtener canciones:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener canciones de un usuario específico
  getUserSongs: async (req, res) => {
    try {
      const { userId } = req.params;
      
      const songs = await Song.findByUserId(userId);

      // Formatear respuesta con tiempo transcurrido
      const formattedSongs = songs.map(song => {
        // Calcular tiempo transcurrido desde created_at
        const createdDate = new Date(song.created_at);
        const now = new Date();
        const diffTime = Math.abs(now - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let timeAgo = '';
        if (diffDays >= 365) {
          const years = Math.floor(diffDays / 365);
          timeAgo = `hace ${years} año${years > 1 ? 's' : ''}`;
        } else if (diffDays >= 30) {
          const months = Math.floor(diffDays / 30);
          timeAgo = `hace ${months} mes${months > 1 ? 'es' : ''}`;
        } else if (diffDays >= 1) {
          timeAgo = `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
        } else {
          const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
          if (diffHours > 0) {
            timeAgo = `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
          } else {
            timeAgo = 'hace unos momentos';
          }
        }

        // Obtener hashtags (genre + tags)
        const hashtags = [];
        if (song.genre) {
          hashtags.push(`#${song.genre.toLowerCase().replace(/\s+/g, '')}`);
        }
        if (song.tags) {
          const tagsArray = song.tags.split(',').map(tag => tag.trim());
          tagsArray.forEach(tag => {
            if (tag) hashtags.push(`#${tag.toLowerCase().replace(/\s+/g, '')}`);
          });
        }

        // Formatear duración
        const durationFormatted = `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}`;

        return {
          id: song.id,
          title: song.title,
          artist: song.username,
          genre: hashtags.join(' '), // Unir todos los hashtags
          timeAgo: timeAgo,
          duration: durationFormatted,
          durationSeconds: song.duration,
          likes: song.likes,
          reposts: song.reposts,
          comments: song.comments,
          plays: song.plays,
          audioUrl: song.audio_url,
          imageUrl: song.image_url,
          created_at: song.created_at,
          // Para construir la URL
          slug: song.slug || song.title.toLowerCase().replace(/\s+/g, '-')
        };
      });

      res.json({
        success: true,
        songs: formattedSongs
      });

    } catch (error) {
      console.error('Error al obtener canciones del usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Incrementar reproducciones
  incrementPlays: async (req, res) => {
    try {
      const { songId } = req.params;
      
      await Song.incrementPlays(songId);

      res.json({
        success: true,
        message: 'Reproducción registrada'
      });

    } catch (error) {
      console.error('Error al incrementar reproducciones:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Añadir comentario
  addComment: async (req, res) => {
    try {
      const userId = req.user.id;
      const { songId } = req.params;
      const { timeInSong, comment, color } = req.body;

      if (!timeInSong || !comment) {
        return res.status(400).json({ error: 'Tiempo y comentario son requeridos' });
      }

      const result = await Song.addComment({
        songId,
        userId,
        timeInSong,
        comment,
        color: color || '#ff5500'
      });

      // Actualizar contador de comentarios en la canción
      await promisePool.query(
        'UPDATE songs SET comments = comments + 1 WHERE id = ?',
        [songId]
      );

      res.status(201).json({
        success: true,
        message: 'Comentario añadido',
        commentId: result.insertId
      });

    } catch (error) {
      console.error('Error al añadir comentario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Toggle like
  toggleLike: async (req, res) => {
    try {
      const userId = req.user.id;
      const { songId } = req.params;

      const result = await Song.toggleLike(songId, userId);

      res.json({
        success: true,
        liked: result.liked
      });

    } catch (error) {
      console.error('Error al dar like:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Verificar si el usuario ya dio like
  checkUserLike: async (req, res) => {
    try {
      const userId = req.user.id;
      const { songId } = req.params;

      const liked = await Song.userLikedSong(songId, userId);

      res.json({
        success: true,
        liked
      });

    } catch (error) {
      console.error('Error al verificar like:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Toggle repost
  toggleRepost: async (req, res) => {
    try {
      const userId = req.user.id;
      const { songId } = req.params;

      const result = await Song.toggleRepost(songId, userId);

      res.json({
        success: true,
        reposted: result.reposted
      });

    } catch (error) {
      console.error('Error al dar repost:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Verificar si el usuario ya hizo repost
  checkUserRepost: async (req, res) => {
    try {
      const userId = req.user.id;
      const { songId } = req.params;

      const reposted = await Song.userRepostedSong(songId, userId);

      res.json({
        success: true,
        reposted
      });

    } catch (error) {
      console.error('Error al verificar repost:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = songController;