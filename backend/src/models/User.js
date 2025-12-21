const { promisePool } = require('../config/database');

const User = {
  // Buscar usuario por email
  findByEmail: async (email) => {
    const [rows] = await promisePool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    return rows;
  },

  // Buscar usuario por username
  findByUsername: async (username) => {
    const [rows] = await promisePool.query('SELECT * FROM usuarios WHERE username = ?', [username]);
    return rows;
  },

  // Crear nuevo usuario
  create: async (userData) => {
    const { email, username, password_hash, birth_date } = userData;
    const [result] = await promisePool.query(
      'INSERT INTO usuarios (email, username, password_hash, birth_date) VALUES (?, ?, ?, ?)',
      [email, username, password_hash, birth_date]
    );
    return result;
  },

  // Guardar código de verificación
  saveVerificationCode: async (email, code) => {
    // Primero eliminamos cualquier código anterior para este email
    await promisePool.query('DELETE FROM email_verification WHERE email = ?', [email]);

    // Insertamos el nuevo código
    const [result] = await promisePool.query(
      'INSERT INTO email_verification (email, code) VALUES (?, ?)', 
      [email, code]
    );
    return result;
  },

  // Verificar código
  verifyCode: async (email, code) => {
    const [rows] = await promisePool.query(
      'SELECT * FROM email_verification WHERE email = ? AND code = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)',
      [email, code]
    );
    return rows;
  },

  // Eliminar código después de verificar
  deleteVerificationCode: async (email) => {
    const [result] = await promisePool.query('DELETE FROM email_verification WHERE email = ?', [email]);
    return result;
  }
};

module.exports = User;