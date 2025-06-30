const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta a la base de datos
const dbPath = path.join(__dirname, 'backend', 'orto_whave_dev.db');

console.log('🔍 Inspeccionando la base de datos SQLite...');
console.log('📍 Ubicación:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar:', err.message);
    return;
  }
  console.log('✅ Conectado a la base de datos SQLite.');
});

// Mostrar todas las tablas
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
  if (err) {
    console.error('❌ Error al obtener tablas:', err.message);
    return;
  }

  console.log('\n📊 TABLAS EN LA BASE DE DATOS:');
  tables.forEach(table => {
    console.log(`  • ${table.name}`);
  });

  // Mostrar estructura de cada tabla
  tables.forEach(table => {
    if (table.name !== 'sqlite_sequence') {
      console.log(`\n🏗️  ESTRUCTURA DE "${table.name.toUpperCase()}":`);

      db.all(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
        if (err) {
          console.error(`❌ Error al obtener estructura de ${table.name}:`, err.message);
          return;
        }

        columns.forEach(col => {
          const nullable = col.notnull ? 'NOT NULL' : 'NULL';
          const defaultVal = col.dflt_value ? `DEFAULT ${col.dflt_value}` : '';
          const primary = col.pk ? '[PRIMARY KEY]' : '';
          console.log(`    ${col.name}: ${col.type} ${nullable} ${defaultVal} ${primary}`);
        });

        // Mostrar datos de la tabla
        db.all(`SELECT * FROM ${table.name}`, [], (err, rows) => {
          if (err) {
            console.error(`❌ Error al obtener datos de ${table.name}:`, err.message);
            return;
          }

          console.log(`\n📋 DATOS EN "${table.name.toUpperCase()}" (${rows.length} registros):`);
          if (rows.length > 0) {
            rows.forEach((row, index) => {
              console.log(`  ${index + 1}.`, row);
            });
          } else {
            console.log('    (Tabla vacía)');
          }
        });
      });
    }
  });

  // Cerrar conexión después de 3 segundos
  setTimeout(() => {
    db.close((err) => {
      if (err) {
        console.error('❌ Error al cerrar:', err.message);
      } else {
        console.log('\n✅ Conexión cerrada.');
      }
    });
  }, 3000);
});
