const User = require('../models/User');

const profileController = {
  // 1. Obtener perfil por username
  getProfileByUsername: async (req, res) => {
    try {
      const { username } = req.params;

      // Buscar usuario por username
      const [users] = await User.findByUsername(username);
      
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
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
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
      const [users] = await User.findById(userId);
      
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
      console.log(`===================================`);

      res.json({
        success: true,
        profile
      });

    } catch (error) {
      console.error('Error al obtener perfil autenticado:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = profileController;