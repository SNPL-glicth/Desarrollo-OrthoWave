const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta a la base de datos
const dbPath = path.join(__dirname, 'orto_whave_dev.db');

console.log('🔍 Probando conexión a SQLite...');
console.log('📍 Ruta de la base de datos:', dbPath);

// Crear conexión
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
    return;
  }
  console.log('✅ Conectado a SQLite exitosamente');
  
  // Verificar tablas existentes
  db.all("SELECT name FROM sqlite_master WHERE type='table';", [], (err, rows) => {
    if (err) {
      console.error('❌ Error obteniendo tablas:', err.message);
      return;
    }
    
    console.log('📊 Tablas encontradas:');
    if (rows.length === 0) {
      console.log('   - No hay tablas (base de datos vacía)');
    } else {
      rows.forEach((row) => {
        console.log(`   - ${row.name}`);
      });
    }
    
    // Cerrar conexión
    db.close((err) => {
      if (err) {
        console.error('❌ Error cerrando conexión:', err.message);
      } else {
        console.log('✅ Conexión cerrada correctamente');
      }
    });
  });
});
