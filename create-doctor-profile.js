#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta a la base de datos
const dbPath = path.join(__dirname, 'backend', 'orto_whave_dev.db');

console.log('🏥 Creando perfil médico para el doctor existente...');
console.log(`📂 Base de datos: ${dbPath}`);

// Conectar a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err.message);
    return;
  }
  console.log('✅ Conectado a la base de datos SQLite');
});

// Función para verificar si ya existe el perfil médico
function verificarPerfilMedico(usuarioId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM perfiles_medicos WHERE usuario_id = ?', [usuarioId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Función para crear perfil médico
function crearPerfilMedico(usuarioId) {
  return new Promise((resolve, reject) => {
    const perfilData = {
      usuario_id: usuarioId,
      numero_registro_medico: 'RM-2024-001',
      especialidad: 'Medicina General',
      subespecialidades: JSON.stringify(['Medicina Interna', 'Medicina Preventiva']),
      universidad_egreso: 'Universidad Nacional de Colombia',
      año_graduacion: 2015,
      biografia: 'Médico especialista en Medicina General con 10 años de experiencia. Especializado en consultas de medicina interna, medicina preventiva y seguimiento de pacientes crónicos.',
      acepta_nuevos_pacientes: true,
      tarifa_consulta: 80000,
      duracion_consulta_default: 45,
      telefono_consultorio: '3009999999',
      direccion_consultorio: 'Consultorio Principal #123',
      ciudad: 'Bogotá',
      dias_atencion: JSON.stringify(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']),
      hora_inicio: '08:00',
      hora_fin: '17:00',
      hora_almuerzo_inicio: '12:00',
      hora_almuerzo_fin: '13:00',
      activo: true,
      verificado_colegio: true
    };

    const query = `
      INSERT INTO perfiles_medicos (
        usuario_id, numero_registro_medico, especialidad, subespecialidades,
        universidad_egreso, año_graduacion, biografia, acepta_nuevos_pacientes,
        tarifa_consulta, duracion_consulta_default, telefono_consultorio,
        direccion_consultorio, ciudad, dias_atencion, hora_inicio, hora_fin,
        hora_almuerzo_inicio, hora_almuerzo_fin, activo, verificado_colegio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      perfilData.usuario_id,
      perfilData.numero_registro_medico,
      perfilData.especialidad,
      perfilData.subespecialidades,
      perfilData.universidad_egreso,
      perfilData.año_graduacion,
      perfilData.biografia,
      perfilData.acepta_nuevos_pacientes,
      perfilData.tarifa_consulta,
      perfilData.duracion_consulta_default,
      perfilData.telefono_consultorio,
      perfilData.direccion_consultorio,
      perfilData.ciudad,
      perfilData.dias_atencion,
      perfilData.hora_inicio,
      perfilData.hora_fin,
      perfilData.hora_almuerzo_inicio,
      perfilData.hora_almuerzo_fin,
      perfilData.activo,
      perfilData.verificado_colegio
    ];

    db.run(query, values, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, ...perfilData });
      }
    });
  });
}

// Función para verificar doctores disponibles
function verificarDoctoresDisponibles() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        pm.*, 
        u.nombre, 
        u.apellido, 
        u.email, 
        u.telefono
      FROM perfiles_medicos pm
      JOIN usuarios u ON pm.usuario_id = u.id
      WHERE pm.activo = 1 AND pm.acepta_nuevos_pacientes = 1
      ORDER BY pm.id
    `;

    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Función principal
async function main() {
  try {
    console.log('\n1. Verificando si ya existe perfil médico para el doctor (ID: 2)...');
    
    const perfilExistente = await verificarPerfilMedico(2);
    
    if (perfilExistente) {
      console.log('✅ El doctor ya tiene un perfil médico');
      console.log(`   - Perfil ID: ${perfilExistente.id}`);
      console.log(`   - Especialidad: ${perfilExistente.especialidad}`);
    } else {
      console.log('📝 El doctor no tiene perfil médico. Creando...');
      
      console.log('\n2. Creando perfil médico...');
      const nuevoPerfil = await crearPerfilMedico(2);
      console.log('✅ Perfil médico creado exitosamente');
      console.log(`   - Perfil ID: ${nuevoPerfil.id}`);
      console.log(`   - Especialidad: ${nuevoPerfil.especialidad}`);
      console.log(`   - Registro Médico: ${nuevoPerfil.numero_registro_medico}`);
      console.log(`   - Universidad: ${nuevoPerfil.universidad_egreso}`);
      console.log(`   - Tarifa: $${nuevoPerfil.tarifa_consulta?.toLocaleString()} COP`);
    }

    console.log('\n3. Verificando doctores disponibles...');
    const doctoresDisponibles = await verificarDoctoresDisponibles();
    
    if (doctoresDisponibles.length > 0) {
      console.log(`📋 Doctores disponibles: ${doctoresDisponibles.length}`);
      doctoresDisponibles.forEach(doctor => {
        console.log(`   - Dr. ${doctor.nombre} ${doctor.apellido}`);
        console.log(`     Email: ${doctor.email}`);
        console.log(`     Especialidad: ${doctor.especialidad}`);
        console.log(`     Tarifa: $${doctor.tarifa_consulta?.toLocaleString()} COP`);
        console.log(`     Acepta nuevos pacientes: ${doctor.acepta_nuevos_pacientes ? 'Sí' : 'No'}`);
        console.log('');
      });
    } else {
      console.log('❌ No hay doctores disponibles');
    }

    console.log('🎉 Proceso completado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante el proceso:', error.message);
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

// Ejecutar
main();
