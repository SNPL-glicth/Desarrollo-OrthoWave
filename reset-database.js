const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta a la base de datos SQLite
const DB_PATH = path.join(__dirname, 'backend', 'database.db');

async function resetDatabase() {
  console.log('🔄 Iniciando reset completo de la base de datos...');
  
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Error al conectar con la base de datos:', err.message);
        reject(err);
        return;
      }
      console.log('✅ Conexión exitosa con la base de datos');
    });

    // Ejecutar limpieza en serie
    db.serialize(() => {
      console.log('🗑️  Eliminando datos relacionados...');
      
      // 1. Eliminar todas las citas
      db.run('DELETE FROM citas', (err) => {
        if (err) console.error('Error eliminando citas:', err.message);
        else console.log('   ✅ Citas eliminadas');
      });

      // 2. Eliminar todas las historias clínicas
      db.run('DELETE FROM historias_clinicas', (err) => {
        if (err) console.error('Error eliminando historias clínicas:', err.message);
        else console.log('   ✅ Historias clínicas eliminadas');
      });

      // 3. Eliminar todos los perfiles médicos
      db.run('DELETE FROM perfiles_medicos', (err) => {
        if (err) console.error('Error eliminando perfiles médicos:', err.message);
        else console.log('   ✅ Perfiles médicos eliminados');
      });

      // 4. Eliminar todos los pacientes
      db.run('DELETE FROM pacientes', (err) => {
        if (err) console.error('Error eliminando pacientes:', err.message);
        else console.log('   ✅ Pacientes eliminados');
      });

      // 5. Eliminar usuarios que NO sean los principales
      db.run(`DELETE FROM usuarios WHERE email NOT IN (
        'admin@ortowhave.com', 
        'doctor@ortowhave.com', 
        'paciente@ortowhave.com'
      )`, (err) => {
        if (err) console.error('Error eliminando usuarios:', err.message);
        else console.log('   ✅ Usuarios adicionales eliminados');
      });

      // 6. Verificar usuarios restantes
      db.all('SELECT id, email, nombre, apellido FROM usuarios ORDER BY id', (err, rows) => {
        if (err) {
          console.error('Error al consultar usuarios:', err.message);
        } else {
          console.log('\n📋 Usuarios restantes en el sistema:');
          rows.forEach(user => {
            console.log(`   - ${user.email} (${user.nombre} ${user.apellido}) - ID: ${user.id}`);
          });
          console.log(`\n📊 Total de usuarios: ${rows.length}`);
        }

        db.close((err) => {
          if (err) {
            console.error('Error al cerrar la base de datos:', err.message);
            reject(err);
          } else {
            console.log('\n🎉 ¡Reset completado exitosamente!');
            console.log('💡 La base de datos está limpia y lista para que crees tus usuarios.');
            console.log('\n👤 Usuarios disponibles para login:');
            console.log('   - admin@ortowhave.com / admin123');
            console.log('   - doctor@ortowhave.com / doctor123');
            console.log('   - paciente@ortowhave.com / paciente123');
            resolve();
          }
        });
      });
    });
  });
}

// Verificar si sqlite3 está disponible
try {
  resetDatabase().catch(console.error);
} catch (error) {
  console.error('❌ Error: sqlite3 no está instalado.');
  console.log('💡 Ejecuta: npm install sqlite3');
  console.log('📝 O usa el método alternativo con el backend API');
}
