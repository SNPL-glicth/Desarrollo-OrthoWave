const sqlite3 = require('sqlite3').verbose();

// Abrir la base de datos
const db = new sqlite3.Database('orto_whave_dev.db');

// Insertar roles si no existen
db.serialize(() => {
  db.run(`INSERT OR IGNORE INTO roles (nombre, activo, fecha_creacion) VALUES
    ('admin', 1, datetime('now')),
    ('doctor', 1, datetime('now')),
    ('paciente', 1, datetime('now'))`, function(err) {
    if (err) {
      console.error('Error al insertar roles:', err);
    } else {
      console.log('Roles insertados correctamente. Filas afectadas:', this.changes);
    }
  });

  // Verificar que se insertaron
  db.all("SELECT * FROM roles", (err, rows) => {
    if (err) {
      console.error('Error al consultar roles:', err);
    } else {
      console.log('Roles en la base de datos:');
      rows.forEach((row) => {
        console.log(`- ID: ${row.id}, Nombre: ${row.nombre}, Activo: ${row.activo}`);
      });
    }

    // Cerrar la base de datos
    db.close();
  });
});
