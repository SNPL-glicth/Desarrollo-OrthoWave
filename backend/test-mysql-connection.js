const mysql = require('mysql2/promise');
require('dotenv').config();

async function testMySQLConnection() {
  console.log('🔍 Probando conexión a MySQL...');
  console.log('📍 Host:', process.env.DB_HOST || 'localhost');
  console.log('📍 Puerto:', process.env.DB_PORT || '3306');
  console.log('📍 Usuario:', process.env.DB_USERNAME || 'ortowhave');
  console.log('📍 Base de datos:', process.env.DB_DATABASE || 'orto_whave_db');

  try {
    // Crear conexión
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USERNAME || 'ortowhave',
      password: process.env.DB_PASSWORD || 'Root1234a',
      database: process.env.DB_DATABASE || 'orto_whave_db',
      charset: 'utf8mb4'
    });

    console.log('✅ Conectado a MySQL exitosamente');

    // Probar query básico
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query de prueba exitoso:', rows);

    // Verificar tablas existentes
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📊 Tablas encontradas:');
    if (tables.length === 0) {
      console.log('   - No hay tablas (base de datos vacía)');
    } else {
      tables.forEach((table) => {
        const tableName = Object.values(table)[0];
        console.log(`   - ${tableName}`);
      });
    }

    // Cerrar conexión
    await connection.end();
    console.log('✅ Conexión cerrada correctamente');

  } catch (error) {
    console.error('❌ Error conectando a MySQL:');
    console.error('   Código:', error.code);
    console.error('   Mensaje:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Verificar que MySQL esté ejecutándose');
      console.log('   2. Verificar la configuración del host y puerto');
      console.log('   3. Verificar que el firewall permita conexiones');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Verificar usuario y contraseña');
      console.log('   2. Verificar permisos del usuario en MySQL');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Crear la base de datos primero');
      console.log('   2. Verificar el nombre de la base de datos');
    }
  }
}

testMySQLConnection();
