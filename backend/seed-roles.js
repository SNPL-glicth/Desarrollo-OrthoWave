const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de conexión MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USERNAME || 'ortowhave',
  password: process.env.DB_PASSWORD || 'Root123a',
  database: process.env.DB_DATABASE || 'orto_whave_db',
};

async function seedRoles() {
  let connection;
  
  try {
    // Conectar a MySQL
    connection = await mysql.createConnection(dbConfig);
    console.log('Conectado a MySQL correctamente');

    // Insertar roles si no existen (MySQL syntax)
    const insertQuery = `INSERT IGNORE INTO roles (nombre, activo, fecha_creacion) VALUES
      ('admin', 1, NOW()),
      ('doctor', 1, NOW()),
      ('paciente', 1, NOW())`;
    
    const [result] = await connection.execute(insertQuery);
    console.log('Roles insertados correctamente. Filas afectadas:', result.affectedRows);

    // Verificar que se insertaron
    const [rows] = await connection.execute('SELECT * FROM roles');
    console.log('Roles en la base de datos:');
    rows.forEach((row) => {
      console.log(`- ID: ${row.id}, Nombre: ${row.nombre}, Activo: ${row.activo}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    // Cerrar la conexión
    if (connection) {
      await connection.end();
      console.log('Conexión cerrada');
    }
  }
}

// Ejecutar el seed
seedRoles();
