const User = require('../models/User');
const { promisePool } = require('../config/database');

const profileController = {
  // 1. Obtener perfil por username
  getProfileByUsername: async (req, res) => {
    try {
      const { username } = req.params;

      // Buscar usuario por username
      const users = await User.findByUsername(username);
      
      if (users.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const user = users[0];

      // Formatear respuesta
      const profile = {
        id: user.id,
        username: user.username,
        email: user.email,
        real_name: user.real_name || '', // Vacío por defecto
        bio: user.bio || '',
        profile_picture_url: user.profile_picture_url || '',
        profile_url: user.profile_url || '',
        birth_date: user.birth_date,
        created_at: user.created_at,
        stats: {
          posts: 0,
          followers: 0,
          following: 0,
          likes: 0
        }
      };

      // Mostrar en consola
      console.log(`\n===================================`);
      console.log(`PERFIL CARGADO`);
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Username: ${user.username}`);
      console.log(`Profile URL: ${user.profile_url}`);
      console.log(`===================================`);

      res.json({
        success: true,
        profile
      });

    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // 2. Obtener perfil del usuario autenticado
  getMyProfile: async (req, res) => {
    try {
      const userId = req.user.id;

      // Buscar usuario por ID
      const users = await User.findById(userId);
      
      if (users.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const user = users[0];
      
      const profile = {
        id: user.id,
        username: user.username,
        email: user.email,
        real_name: user.real_name || '',
        bio: user.bio || '',
        profile_picture_url: user.profile_picture_url || '',
        profile_url: user.profile_url || '',
        birth_date: user.birth_date,
        created_at: user.created_at,
        stats: {
          posts: 0,
          followers: 0,
          following: 0,
          likes: 0
        }
      };

      console.log(`\n===================================`);
      console.log(`PERFIL AUTENTICADO CARGADO`);
      console.log(`ID: ${user.id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Profile URL: ${user.profile_url}`);
      console.log(`===================================`);

      res.json({
        success: true,
        profile
      });

    } catch (error) {
      console.error('Error al obtener perfil autenticado:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // 3. Actualizar perfil del usuario autenticado
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const { username, real_name, bio, profile_url } = req.body;

      // Verificar que al menos un campo sea proporcionado
      if (!username && !real_name && !bio && !profile_url) {
        return res.status(400).json({ error: 'Debe proporcionar al menos un campo para actualizar' });
      }

      // Si se está cambiando el username, verificar que no esté en uso por otro usuario
      if (username) {
        const existingUser = await User.findByUsername(username);
        if (existingUser.length > 0 && existingUser[0].id !== userId) {
          return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
        }
      }

      // Si se está cambiando el profile_url, verificar que no esté en uso por otro usuario
      if (profile_url) {
        const existingUser = await User.findByProfileUrl(profile_url);
        if (existingUser.length > 0 && existingUser[0].id !== userId) {
          return res.status(400).json({ error: 'La URL del perfil ya está en uso' });
        }
      }

      // Actualizar perfil
      await User.updateProfile(userId, {
        username,
        real_name,
        bio,
        profile_url
      });

      // Obtener el usuario actualizado
      const users = await User.findById(userId);
      const user = users[0];

      console.log(`\n===================================`);
      console.log(`PERFIL ACTUALIZADO`);
      console.log(`ID: ${user.id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Profile URL: ${user.profile_url}`);
      console.log(`===================================`);

      res.json({
        success: true,
        message: 'Perfil actualizado',
        profile: {
          id: user.id,
          username: user.username,
          email: user.email,
          real_name: user.real_name,
          bio: user.bio,
          profile_url: user.profile_url,
          birth_date: user.birth_date,
          created_at: user.created_at
        }
      });

    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // 4. Subir foto de perfil
  uploadProfilePicture: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Verificar que se haya subido un archivo
      if (!req.file) {
        return res.status(400).json({ error: 'No se ha subido ninguna imagen' });
      }

      // Construir la ruta relativa de la imagen
      const profilePictureUrl = `/uploads/pictures/${req.file.filename}`;

      // Actualizar la foto de perfil en la base de datos
      const [result] = await promisePool.query(
        'UPDATE users SET profile_picture_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [profilePictureUrl, userId]
      );

      // Obtener el usuario actualizado
      const users = await User.findById(userId);
      const user = users[0];

      console.log(`\n===================================`);
      console.log(`FOTO DE PERFIL ACTUALIZADA`);
      console.log(`ID: ${user.id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Profile URL: ${user.profile_url}`);
      console.log(`Picture: ${profilePictureUrl}`);
      console.log(`===================================`);

      res.json({
        success: true,
        message: 'Foto de perfil actualizada',
        profile_picture_url: profilePictureUrl
      });

    } catch (error) {
      console.error('Error al subir foto de perfil:', error);
      
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'La imagen es demasiado grande (máximo 5MB)' });
      }
      
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = profileController;