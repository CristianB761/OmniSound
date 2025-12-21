const { promisePool } = require('../config/database');

async function testConnection() {
    try {
        console.log('Probando conexión a MySQL...');

        // Consulta simple
        const [rows] = await promisePool.query('SELECT 1 + 1 AS result');
        console.log('Conexión exitosa. Resultado:', rows[0].result);

        // Ver bases de datos disponibles
        const [databases] = await promisePool.query('SHOW DATABASES');
        console.log('Bases de datos disponibles:');
        databases.forEach(db => {
            console.log(`   - ${db.Database}`);
        });

        // Ver tablas en OmniSoundDB
        const [tables] = await promisePool.query('SHOW TABLES FROM OmniSoundDB');
        console.log('Tablas en OmniSoundDB:');
        tables.forEach(table => {
            console.log(`   - ${Object.values(table)[0]}`);
        });

        console.log('Todo funcionando correctamente!');
        process.exit(0);

    } catch (error) {
        console.error('Error:', error.message);
        console.log('\nPosibles soluciones:');
        console.log('1. Verifica que MySQL esté corriendo');
        console.log('2. Revisa usuario/contraseña en .env');
        console.log('3. Ejecuta CREATE DATABASE OmniSoundDB; en MySQL');
        process.exit(1);
    }
}

testConnection();