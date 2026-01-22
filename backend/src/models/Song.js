const { promisePool } = require('../config/database');

const Song = {
  // Crear nueva canción
  create: async (songData) => {
    const { 
      userId, 
      title, 
      artist, 
      genre, 
      audioUrl, 
      imageUrl, 
      duration,
      tags,
      description,
      privacy
    } = songData;

    const [result] = await promisePool.query(
      `INSERT INTO songs 
        (user_id, title, artist, genre, audio_url, image_url, duration, tags, description, privacy) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, title, artist, genre, audioUrl, imageUrl, duration, tags, description, privacy]
    );

    return { insertId: result.insertId };
  },

  // Obtener canción por ID
  findById: async (id) => {
    const [rows] = await promisePool.query(
      `SELECT songs.*, users.username, users.profile_picture_url 
        FROM songs 
        JOIN users ON songs.user_id = users.id 
        WHERE songs.id = ?`,
      [id]
    );
    return rows;
  },

  // Obtener canciones de un usuario
  findByUserId: async (userId) => {
    const [rows] = await promisePool.query(
      `SELECT songs.*, users.username, users.profile_picture_url 
        FROM songs 
        JOIN users ON songs.user_id = users.id 
        WHERE songs.user_id = ? 
        ORDER BY songs.created_at DESC`,
      [userId]
    );
    return rows;
  },

  // Obtener todas las canciones (para feed)
  findAll: async (limit = 20, offset = 0) => {
    const [rows] = await promisePool.query(
      `SELECT songs.*, users.username, users.profile_picture_url 
        FROM songs 
        JOIN users ON songs.user_id = users.id 
        ORDER BY songs.created_at DESC 
        LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  },

  // Incrementar contador de reproducciones
  incrementPlays: async (songId) => {
    const [result] = await promisePool.query(
      'UPDATE songs SET plays = plays + 1 WHERE id = ?',
      [songId]
    );
    return result;
  },

  // Obtener comentarios de una canción
  getComments: async (songId) => {
    const [rows] = await promisePool.query(
      `SELECT song_comments.*, users.username 
        FROM song_comments 
        JOIN users ON song_comments.user_id = users.id 
        WHERE song_comments.song_id = ? 
        ORDER BY song_comments.time_in_song ASC`,
      [songId]
    );
    return rows;
  },

  // Añadir comentario
  addComment: async (commentData) => {
    const { songId, userId, timeInSong, comment, color } = commentData;

    const [result] = await promisePool.query(
      `INSERT INTO song_comments (song_id, user_id, time_in_song, comment, color) 
        VALUES (?, ?, ?, ?, ?)`,
      [songId, userId, timeInSong, comment, color]
    );
    
    return { insertId: result.insertId };
  },

  // Toggle like
  toggleLike: async (songId, userId) => {
    // Verificar si ya existe el like
    const [existing] = await promisePool.query(
      'SELECT id FROM song_likes WHERE song_id = ? AND user_id = ?',
      [songId, userId]
    );

    if (existing.length > 0) {
      // Eliminar like
      await promisePool.query(
        'DELETE FROM song_likes WHERE song_id = ? AND user_id = ?',
        [songId, userId]
      );
      await promisePool.query(
        'UPDATE songs SET likes = likes - 1 WHERE id = ?',
        [songId]
      );
      return { liked: false };
    } else {
      // Añadir like
      await promisePool.query(
        'INSERT INTO song_likes (song_id, user_id) VALUES (?, ?)',
        [songId, userId]
      );
      await promisePool.query(
        'UPDATE songs SET likes = likes + 1 WHERE id = ?',
        [songId]
      );
      return { liked: true };
    }
  },

  // Verificar si el usuario ya dio like
  userLikedSong: async (songId, userId) => {
    const [rows] = await promisePool.query(
      'SELECT id FROM song_likes WHERE song_id = ? AND user_id = ?',
      [songId, userId]
    );
    return rows.length > 0;
  }
};

module.exports = Song;