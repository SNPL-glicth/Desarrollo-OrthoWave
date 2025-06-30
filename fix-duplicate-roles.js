const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Configuración de la base de datos
const dbPath = path.join(__dirname, 'backend', 'orto_whave_dev.db');

console.log('🔧 Limpiando roles duplicados...');
console.log(`📍 Base de datos: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err.message);
    return;
  }
  console.log('✅ Conectado a la base de datos SQLite.');
});

// Primero verificar los roles actuales
db.all("SELECT * FROM roles ORDER BY id", (err, rows) => {
  if (err) {
    console.error('❌ Error al consultar roles:', err.message);
    return;
  }

  console.log('\n📋 ROLES ACTUALES:');
  rows.forEach(role => {
    console.log(`  ${role.id}. ${role.nombre} (activo: ${role.activo})`);
  });

  // Eliminar roles duplicados (mantener solo los IDs 1, 2, 3)
  console.log('\n🗑️ Eliminando roles duplicados...');

  db.run("DELETE FROM roles WHERE id IN (4, 5, 6)", function(err) {
    if (err) {
      console.error('❌ Error al eliminar roles duplicados:', err.message);
      return;
    }

    console.log(`✅ ${this.changes} roles duplicados eliminados.`);

    // Verificar resultado final
    db.all("SELECT * FROM roles ORDER BY id", (err, rows) => {
      if (err) {
        console.error('❌ Error al verificar resultado:', err.message);
        return;
      }

      console.log('\n📋 ROLES DESPUÉS DE LIMPIEZA:');
      rows.forEach(role => {
        console.log(`  ${role.id}. ${role.nombre} (activo: ${role.activo})`);
      });

      console.log('\n✅ Limpieza de roles completada exitosamente.');

      // Cerrar la conexión
      db.close((err) => {
        if (err) {
          console.error('❌ Error al cerrar la base de datos:', err.message);
        } else {
          console.log('✅ Conexión a la base de datos cerrada.');
        }
      });
    });
  });
});
