const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta a la base de datos SQLite
const DB_PATH = path.join(__dirname, 'backend', 'database.db');

async function inspectAndResetDatabase() {
  console.log('🔍 Inspeccionando estructura de la base de datos...');
  
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Error al conectar con la base de datos:', err.message);
        reject(err);
        return;
      }
      console.log('✅ Conexión exitosa con la base de datos');
    });

    // Primero, inspeccionar las tablas existentes
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        console.error('Error al obtener tablas:', err.message);
        reject(err);
        return;
      }

      console.log('\n📋 Tablas encontradas:');
      tables.forEach(table => {
        console.log(`   - ${table.name}`);
      });

      // Ahora hacer el reset con los nombres correctos
      db.serialize(() => {
        console.log('\n🗑️  Iniciando limpieza de datos...');
        
        // Eliminar en orden correcto (respetando foreign keys)
        const deleteQueries = [
          'DELETE FROM historias_clinicas',
          'DELETE FROM citas', 
          'DELETE FROM perfiles_medicos',
          'DELETE FROM pacientes',
          `DELETE FROM usuarios WHERE email NOT IN (
            'admin@ortowhave.com', 
            'doctor@ortowhave.com', 
            'paciente@ortowhave.com'
          )`
        ];

        deleteQueries.forEach((query, index) => {
          db.run(query, (err) => {
            if (err) {
              console.log(`   ⚠️  ${query.split(' ')[2]}: ${err.message}`);
            } else {
              console.log(`   ✅ ${query.split(' ')[2]} limpiada`);
            }
          });
        });

        // Verificar usuarios restantes después de la limpieza
        setTimeout(() => {
          db.all('SELECT id, email, nombre, apellido FROM usuarios ORDER BY id', (err, rows) => {
            if (err) {
              console.error('Error al consultar usuarios:', err.message);
            } else {
              console.log('\n📋 Usuarios restantes en el sistema:');
              if (rows.length === 0) {
                console.log('   ⚠️  No se encontraron usuarios');
              } else {
                rows.forEach(user => {
                  console.log(`   - ${user.email} (${user.nombre} ${user.apellido}) - ID: ${user.id}`);
                });
              }
              console.log(`\n📊 Total de usuarios: ${rows.length}`);
            }

            db.close((err) => {
              if (err) {
                console.error('Error al cerrar la base de datos:', err.message);
                reject(err);
              } else {
                console.log('\n🎉 ¡Reset completado!');
                console.log('💡 Ahora puedes crear tus propios doctores y pacientes.');
                console.log('\n👤 Usuarios principales disponibles:');
                console.log('   - admin@ortowhave.com / admin123');
                console.log('   - doctor@ortowhave.com / doctor123');  
                console.log('   - paciente@ortowhave.com / paciente123');
                resolve();
              }
            });
          });
        }, 1000); // Dar tiempo para que se completen las eliminaciones
      });
    });
  });
}

// Ejecutar
inspectAndResetDatabase().catch(console.error);
