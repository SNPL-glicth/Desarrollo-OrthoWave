const path = require('path');
const sqlite3 = require(path.join(__dirname, 'backend', 'node_modules', 'sqlite3')).verbose();
const bcrypt = require(path.join(__dirname, 'backend', 'node_modules', 'bcrypt'));

// Ruta a la base de datos
const dbPath = path.join(__dirname, 'backend', 'orto_whave_dev.db');

console.log('🔧 Configurando usuarios específicos...');
console.log('📍 Base de datos:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar:', err.message);
    return;
  }
  console.log('✅ Conectado a la base de datos SQLite.');
});

// Usuarios específicos a crear
const usuariosEspecificos = [
  {
    email: 'admin@ortowhave.com',
    password: 'admin123',
    nombre: 'Administrador',
    apellido: 'Sistema',
    telefono: '3001111111',
    direccion: 'Oficina Central',
    rol_id: 1, // admin
    is_verified: 1
  },
  {
    email: 'doctor@ortowhave.com',
    password: 'doctor123',
    nombre: 'Doctor',
    apellido: 'Principal',
    telefono: '3002222222',
    direccion: 'Consultorio Médico',
    rol_id: 2, // doctor
    is_verified: 1
  },
  {
    email: 'paciente@ortowhave.com',
    password: 'paciente123',
    nombre: 'Paciente',
    apellido: 'Demo',
    telefono: '3003333333',
    direccion: 'Dirección Paciente',
    rol_id: 3, // paciente
    is_verified: 1
  }
];

async function limpiarYCrearUsuarios() {
  try {
    console.log('🧹 Limpiando usuarios existentes...');

    // Limpiar tablas relacionadas primero
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM historias_clinicas', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM citas', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM pacientes', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM perfiles_medicos', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Limpiar usuarios
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM usuarios', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('✅ Usuarios existentes eliminados');

    console.log('👥 Creando usuarios específicos...');

    for (const usuario of usuariosEspecificos) {
      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(usuario.password, 12);

      await new Promise((resolve, reject) => {
        const query = `
          INSERT INTO usuarios (email, password, nombre, apellido, telefono, direccion, rol_id, is_verified, verification_code)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(query, [
          usuario.email,
          hashedPassword,
          usuario.nombre,
          usuario.apellido,
          usuario.telefono,
          usuario.direccion,
          usuario.rol_id,
          usuario.is_verified,
          null // No necesita código de verificación
        ], function(err) {
          if (err) {
            reject(err);
          } else {
            console.log(`✅ Usuario creado: ${usuario.email} (ID: ${this.lastID})`);
            resolve();
          }
        });
      });
    }

    console.log('🎉 ¡Usuarios específicos creados exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('👑 Admin: admin@ortowhave.com / admin123');
    console.log('👨‍⚕️ Doctor: doctor@ortowhave.com / doctor123');
    console.log('👤 Paciente: paciente@ortowhave.com / paciente123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('❌ Error al cerrar:', err.message);
      } else {
        console.log('✅ Conexión cerrada.');
      }
    });
  }
}

// Ejecutar el proceso
limpiarYCrearUsuarios();
