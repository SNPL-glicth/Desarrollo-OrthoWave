const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta a la base de datos
const dbPath = path.join(__dirname, 'backend', 'orto_whave_dev.db');

console.log('🔍 Verificando base de datos en:', dbPath);

// Conectar a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectado a la base de datos SQLite');
});

// Función para mostrar usuarios
function showUsers() {
  return new Promise((resolve, reject) => {
    console.log('\n👥 USUARIOS EN LA BASE DE DATOS:');
    console.log('='.repeat(50));
    
    db.all(`
      SELECT u.id, u.nombre, u.apellido, u.email, r.nombre as rol, u.is_verified as verificado 
      FROM usuarios u 
      LEFT JOIN roles r ON u.rol_id = r.id
      ORDER BY u.id
    `, (err, rows) => {
      if (err) {
        console.error('❌ Error al obtener usuarios:', err.message);
        reject(err);
      } else {
        if (rows.length === 0) {
          console.log('❌ No hay usuarios en la base de datos');
        } else {
          rows.forEach(user => {
            console.log(`ID: ${user.id}, Nombre: ${user.nombre} ${user.apellido}, Email: ${user.email}, Rol: ${user.rol}, Verificado: ${user.verificado}`);
          });
        }
        resolve(rows);
      }
    });
  });
}

// Función para mostrar citas
function showCitas() {
  return new Promise((resolve, reject) => {
    console.log('\n📋 CITAS EN LA BASE DE DATOS:');
    console.log('='.repeat(50));
    
    db.all(`
      SELECT c.id, c.paciente_id, c.doctor_id, c.fechaHora, c.estado, c.tipoConsulta, c.motivoConsulta,
             p.nombre as paciente_nombre, p.apellido as paciente_apellido,
             d.nombre as doctor_nombre, d.apellido as doctor_apellido
      FROM citas c
      LEFT JOIN usuarios p ON c.paciente_id = p.id
      LEFT JOIN usuarios d ON c.doctor_id = d.id
      ORDER BY c.fechaHora DESC
    `, (err, rows) => {
      if (err) {
        console.error('❌ Error al obtener citas:', err.message);
        reject(err);
      } else {
        if (rows.length === 0) {
          console.log('❌ No hay citas en la base de datos');
        } else {
          rows.forEach(cita => {
            console.log(`ID: ${cita.id}, Paciente: ${cita.paciente_nombre} ${cita.paciente_apellido} (${cita.paciente_id}), Doctor: ${cita.doctor_nombre} ${cita.doctor_apellido} (${cita.doctor_id}), Fecha: ${cita.fechaHora}, Estado: ${cita.estado}, Motivo: ${cita.motivoConsulta}`);
          });
        }
        resolve(rows);
      }
    });
  });
}

// Función para crear citas de prueba
function createTestCitas(users) {
  return new Promise((resolve, reject) => {
    console.log('\n🧪 CREANDO CITAS DE PRUEBA:');
    console.log('='.repeat(50));
    
    // Encontrar pacientes y doctores
    const pacientes = users.filter(u => u.rol === 'paciente');
    const doctores = users.filter(u => u.rol === 'doctor');
    
    if (pacientes.length === 0 || doctores.length === 0) {
      console.log('❌ No se pueden crear citas: faltan pacientes o doctores');
      resolve();
      return;
    }
    
    console.log(`📊 Encontrados ${pacientes.length} pacientes y ${doctores.length} doctores`);
    
    // Crear fechas de ejemplo
    const fechas = [
      new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Pasado mañana
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Próxima semana
    ];
    
    const citas = [];
    
    // Crear citas para cada combinación paciente-doctor
    pacientes.forEach((paciente, pIndex) => {
      doctores.forEach((doctor, dIndex) => {
        if (pIndex < fechas.length) {
          const fecha = fechas[pIndex];
          fecha.setHours(9 + dIndex * 2, 0, 0, 0); // 9:00, 11:00, 13:00, etc.
          
          citas.push({
            pacienteId: paciente.id,
            doctorId: doctor.id,
            fechaHora: fecha.toISOString(),
            duracion: 60,
            estado: 'pendiente',
            tipoConsulta: 'primera_vez',
            motivoConsulta: `Consulta de prueba para ${paciente.nombre}`,
            fechaCreacion: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString()
          });
        }
      });
    });
    
    if (citas.length === 0) {
      console.log('❌ No se generaron citas');
      resolve();
      return;
    }
    
    console.log(`📝 Insertando ${citas.length} citas...`);
    
    // Insertar citas
    let insertedCount = 0;
    citas.forEach((cita, index) => {
      db.run(`
        INSERT INTO citas (paciente_id, doctor_id, fechaHora, duracion, estado, tipoConsulta, motivoConsulta, fecha_creacion, fecha_actualizacion)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        cita.pacienteId, cita.doctorId, cita.fechaHora, cita.duracion, cita.estado, 
        cita.tipoConsulta, cita.motivoConsulta, cita.fechaCreacion, cita.fechaActualizacion
      ], function(err) {
        if (err) {
          console.error(`❌ Error al insertar cita ${index + 1}:`, err.message);
        } else {
          console.log(`✅ Cita ${index + 1} insertada con ID: ${this.lastID}`);
          insertedCount++;
        }
        
        if (index === citas.length - 1) {
          console.log(`📊 Total de citas insertadas: ${insertedCount}/${citas.length}`);
          resolve();
        }
      });
    });
  });
}

// Función principal
async function main() {
  try {
    // Mostrar usuarios
    const users = await showUsers();
    
    // Mostrar citas existentes
    await showCitas();
    
    // Crear citas de prueba si no hay ninguna
    const citasExistentes = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM citas', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    if (citasExistentes === 0) {
      console.log('\n🔄 No hay citas existentes, creando citas de prueba...');
      await createTestCitas(users);
      
      // Mostrar citas después de crear
      await showCitas();
    } else {
      console.log(`\n📊 Ya existen ${citasExistentes} citas en la base de datos`);
    }
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error.message);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('❌ Error al cerrar la base de datos:', err.message);
      } else {
        console.log('✅ Conexión a la base de datos cerrada');
      }
    });
  }
}

main();
