#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta a la base de datos
const dbPath = path.join(__dirname, 'backend', 'orto_whave_dev.db');

console.log('🧹 Iniciando limpieza directa de la base de datos...');
console.log(`📂 Base de datos: ${dbPath}`);

// Conectar a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err.message);
    return;
  }
  console.log('✅ Conectado a la base de datos SQLite');
});

// Usuarios que queremos mantener (solo estos 3)
const usuariosPermitidos = [
  'admin@ortowhave.com',
  'doctor@ortowhave.com', 
  'paciente@ortowhave.com'
];

// Función para verificar usuarios actuales
function verificarUsuarios() {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT u.id, u.nombre, u.apellido, u.email, r.nombre as rol, u.is_verified
      FROM usuarios u 
      LEFT JOIN roles r ON u.rol_id = r.id
      ORDER BY u.id
    `, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Función para eliminar usuarios
function eliminarUsuario(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM usuarios WHERE id = ?', [id], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

// Función para eliminar citas de usuarios eliminados
function eliminarCitasOrfanas() {
  return new Promise((resolve, reject) => {
    db.run(`
      DELETE FROM citas 
      WHERE paciente_id NOT IN (SELECT id FROM usuarios)
      OR doctor_id NOT IN (SELECT id FROM usuarios)
    `, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

// Función para eliminar perfiles médicos órfanos
function eliminarPerfilesMedicosOrfanos() {
  return new Promise((resolve, reject) => {
    db.run(`
      DELETE FROM perfiles_medicos 
      WHERE usuario_id NOT IN (SELECT id FROM usuarios)
    `, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

// Función para eliminar pacientes órfanos
function eliminarPacientesOrfanos() {
  return new Promise((resolve, reject) => {
    db.run(`
      DELETE FROM pacientes 
      WHERE usuario_id NOT IN (SELECT id FROM usuarios)
    `, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

// Función principal
async function limpiarBaseDatos() {
  try {
    // 1. Verificar usuarios actuales
    console.log('\n1. Verificando usuarios actuales...');
    const usuariosActuales = await verificarUsuarios();
    console.log(`📊 Usuarios encontrados: ${usuariosActuales.length}`);

    // 2. Identificar usuarios a eliminar
    const usuariosAEliminar = usuariosActuales.filter(u => 
      !usuariosPermitidos.includes(u.email)
    );

    console.log('\n2. Usuarios a eliminar:');
    usuariosAEliminar.forEach(u => {
      console.log(`   - ID ${u.id}: ${u.nombre} ${u.apellido} (${u.email}) - ${u.rol}`);
    });

    if (usuariosAEliminar.length === 0) {
      console.log('✅ No hay usuarios adicionales para eliminar');
      return;
    }

    // 3. Eliminar usuarios
    console.log('\n3. Eliminando usuarios...');
    for (const usuario of usuariosAEliminar) {
      const cambios = await eliminarUsuario(usuario.id);
      console.log(`   ✅ Eliminado usuario ID ${usuario.id}: ${usuario.nombre} ${usuario.apellido}`);
    }

    // 4. Limpiar citas huérfanas
    console.log('\n4. Eliminando citas huérfanas...');
    const citasEliminadas = await eliminarCitasOrfanas();
    console.log(`   ✅ Eliminadas ${citasEliminadas} citas huérfanas`);

    // 5. Limpiar perfiles médicos huérfanos
    console.log('\n5. Eliminando perfiles médicos huérfanos...');
    const perfilesEliminados = await eliminarPerfilesMedicosOrfanos();
    console.log(`   ✅ Eliminados ${perfilesEliminados} perfiles médicos huérfanos`);

    // 6. Limpiar pacientes huérfanos
    console.log('\n6. Eliminando pacientes huérfanos...');
    const pacientesEliminados = await eliminarPacientesOrfanos();
    console.log(`   ✅ Eliminados ${pacientesEliminados} pacientes huérfanos`);

    // 7. Verificar resultado final
    console.log('\n7. Verificando resultado final...');
    const usuariosFinales = await verificarUsuarios();
    console.log(`📊 Usuarios restantes: ${usuariosFinales.length}`);

    console.log('\n👥 Usuarios finales:');
    usuariosFinales.forEach(u => {
      console.log(`   - ID ${u.id}: ${u.nombre} ${u.apellido} (${u.email}) - ${u.rol} - Verificado: ${u.is_verified ? 'Sí' : 'No'}`);
    });

    console.log('\n🎉 Limpieza de base de datos completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    // Cerrar conexión
    db.close((err) => {
      if (err) {
        console.error('❌ Error al cerrar la base de datos:', err.message);
      } else {
        console.log('✅ Conexión a la base de datos cerrada');
      }
    });
  }
}

// Ejecutar limpieza
limpiarBaseDatos();
