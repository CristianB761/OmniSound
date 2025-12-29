const { promisePool } = require('../config/database');

const User = {
  // Buscar usuario por email
  findByEmail: async (email) => {
    const [rows] = await promisePool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows;
  },

  // Buscar usuario por username
  findByUsername: async (username) => {
    const [rows] = await promisePool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows;
  },

  // Obtener y aumentar el contador de usuarios
  getNextUserNumber: async () => {
    try {
      // Iniciar transacción para asegurar atomicidad
      await promisePool.query('START TRANSACTION');

      // Obtener el último número usado
      const [rows] = await promisePool.query(
        'SELECT last_number FROM user_counter WHERE id = 1 FOR UPDATE'
      );

      let nextNumber;
      if (rows.length === 0) {
        // Si no existe contador, empezamos desde 1
        nextNumber = 1;
        await promisePool.query(
          'INSERT INTO user_counter (last_number) VALUES (?)',
          [nextNumber]
        );
      } else {
        // Incrementar el contador
        nextNumber = rows[0].last_number + 1;
        await promisePool.query(
          'UPDATE user_counter SET last_number = ? WHERE id = 1',
          [nextNumber]
        );
      }
      
      await promisePool.query('COMMIT');
      return nextNumber;
      
    } catch (error) {
      await promisePool.query('ROLLBACK');
      console.error('Error obteniendo próximo número de usuario:', error);
      throw error;
    }
  },

  // Crear nuevo usuario con username temporal
  create: async (userData) => {
    const { email, password_hash, birth_date } = userData;

    // Obtener el próximo número secuencial
    const nextNumber = await User.getNextUserNumber();

    // Formatear a 13 dígitos con ceros a la izquierda
    const paddedNumber = nextNumber.toString().padStart(13, '0');
    const username = `user${paddedNumber}`;

    // Insertar usuario
    const [result] = await promisePool.query(
      'INSERT INTO users (email, username, password_hash, birth_date) VALUES (?, ?, ?, ?)',
      [email, username, password_hash, birth_date]
    );

    // Devolvemos también el username generado
    return { 
      insertId: result.insertId, 
      username,
      userNumber: nextNumber 
    };
  },

  // Guardar código de verificación
  saveVerificationCode: async (email, code) => {
    await promisePool.query('DELETE FROM email_verifications WHERE email = ?', [email]);
    const [result] = await promisePool.query(
      'INSERT INTO email_verifications (email, code) VALUES (?, ?)', 
      [email, code]
    );
    return result;
  },

  // Verificar código
  verifyCode: async (email, code) => {
    const [rows] = await promisePool.query(
      'SELECT * FROM email_verifications WHERE email = ? AND code = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)',
      [email, code]
    );
    return rows;
  },

  // Eliminar código después de verificar
  deleteVerificationCode: async (email) => {
    const [result] = await promisePool.query('DELETE FROM email_verifications WHERE email = ?', [email]);
    return result;
  }
};

module.exports = User;