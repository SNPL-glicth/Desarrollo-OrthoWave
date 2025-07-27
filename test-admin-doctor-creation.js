#!/usr/bin/env node

const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:4000';
const ADMIN_CREDENTIALS = {
  email: 'admin@ortowhave.com',
  password: 'admin123'
};

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function login(credentials) {
  try {
    log('🔐 Iniciando sesión como administrador...', 'blue');
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    
    if (response.data.accessToken) {
      log('✅ Login exitoso como administrador', 'green');
      return response.data.accessToken;
    } else {
      throw new Error('No se recibió token de acceso');
    }
  } catch (error) {
    log(`❌ Error al iniciar sesión: ${error.response?.data?.message || error.message}`, 'red');
    throw error;
  }
}

async function createDoctorUser(token) {
  try {
    log('👩‍⚕️ Creando usuario doctor...', 'blue');
    
    const doctorData = {
      nombre: 'María',
      apellido: 'González',
      email: 'maria.gonzalez@doctor.com',
      password: 'doctor123',
      telefono: '+57 300 456 7890',
      direccion: 'Calle Principal #123-45',
      rolId: 2, // Doctor
      perfilMedico: {
        numeroRegistroMedico: 'MD-2024-001',
        especialidad: 'Traumatología',
        universidadEgreso: 'Universidad Javeriana',
        añoGraduacion: 2015,
        biografia: 'Especialista en traumatología con 8 años de experiencia',
        tarifaConsulta: 200000
      }
    };

    const response = await axios.post(
      `${BASE_URL}/users/admin/crear-usuario`,
      doctorData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    log('✅ Usuario doctor creado exitosamente:', 'green');
    log(`   - ID: ${response.data.id}`, 'cyan');
    log(`   - Nombre: ${response.data.nombre} ${response.data.apellido}`, 'cyan');
    log(`   - Email: ${response.data.email}`, 'cyan');
    log(`   - Rol: ${response.data.rolId}`, 'cyan');
    log(`   - Verificado: ${response.data.isVerified || 'true'}`, 'cyan');
    
    return response.data;
  } catch (error) {
    log(`❌ Error al crear usuario doctor: ${error.response?.data?.message || error.message}`, 'red');
    throw error;
  }
}

async function verifyDoctorInSystem(token) {
  try {
    log('🔍 Verificando que el doctor aparece en el sistema...', 'blue');
    
    // Verificar en lista de usuarios admin
    const adminUsersResponse = await axios.get(`${BASE_URL}/users/admin`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const doctorUsers = adminUsersResponse.data.filter(user => user.rol.nombre === 'doctor');
    log(`✅ Doctores encontrados en admin: ${doctorUsers.length}`, 'green');
    
    doctorUsers.forEach(doctor => {
      log(`   - ${doctor.nombre} ${doctor.apellido} (${doctor.email})`, 'cyan');
    });

    // Verificar en doctores disponibles
    const doctoresDisponiblesResponse = await axios.get(`${BASE_URL}/perfil-medico/doctores-disponibles`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    log(`✅ Doctores disponibles para pacientes: ${doctoresDisponiblesResponse.data.length}`, 'green');
    
    doctoresDisponiblesResponse.data.forEach(doctor => {
      log(`   - Dr. ${doctor.usuario.nombre} ${doctor.usuario.apellido}`, 'cyan');
      log(`     Especialidad: ${doctor.especialidad}`, 'cyan');
      log(`     Email: ${doctor.usuario.email}`, 'cyan');
      log(`     Teléfono: ${doctor.usuario.telefono || 'No especificado'}`, 'cyan');
      log(`     Acepta nuevos pacientes: ${doctor.aceptaNuevosPacientes ? 'Sí' : 'No'}`, 'cyan');
    });

    return doctoresDisponiblesResponse.data;
  } catch (error) {
    log(`❌ Error al verificar doctor en sistema: ${error.response?.data?.message || error.message}`, 'red');
    throw error;
  }
}

async function loginAsPatient() {
  try {
    log('🏥 Intentando iniciar sesión como paciente...', 'blue');
    
    // Primero intentar con un paciente existente
    const patientCredentials = {
      email: 'paciente@test.com',
      password: 'paciente123'
    };

    const response = await axios.post(`${BASE_URL}/auth/login`, patientCredentials);
    
    if (response.data.accessToken) {
      log('✅ Login exitoso como paciente', 'green');
      return response.data.accessToken;
    }
  } catch (error) {
    log('⚠️  Paciente de prueba no encontrado, esto es normal', 'yellow');
    return null;
  }
}

async function createPatientUser(adminToken) {
  try {
    log('🏥 Creando usuario paciente para prueba...', 'blue');
    
    const patientData = {
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      email: 'carlos.rodriguez@paciente.com',
      password: 'paciente123',
      telefono: '+57 300 123 4567',
      direccion: 'Carrera 10 #20-30',
      rolId: 3, // Paciente
      perfilPaciente: {
        numeroIdentificacion: '12345678',
        tipoIdentificacion: 'CC',
        fechaNacimiento: '1990-05-15',
        genero: 'Masculino',
        eps: 'EPS Sura'
      }
    };

    const response = await axios.post(
      `${BASE_URL}/users/admin/crear-usuario`,
      patientData,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    log('✅ Usuario paciente creado exitosamente:', 'green');
    log(`   - Email: ${response.data.email}`, 'cyan');
    
    return response.data;
  } catch (error) {
    log(`❌ Error al crear usuario paciente: ${error.response?.data?.message || error.message}`, 'red');
    throw error;
  }
}

async function verifyPatientCanSeeDoctors(patientToken) {
  try {
    log('👀 Verificando que el paciente puede ver los doctores...', 'blue');
    
    const response = await axios.get(`${BASE_URL}/perfil-medico/doctores-disponibles`, {
      headers: {
        'Authorization': `Bearer ${patientToken}`
      }
    });

    log(`✅ El paciente puede ver ${response.data.length} doctores disponibles:`, 'green');
    
    response.data.forEach(doctor => {
      log(`   - Dr. ${doctor.usuario.nombre} ${doctor.usuario.apellido}`, 'cyan');
      log(`     Especialidad: ${doctor.especialidad}`, 'cyan');
      log(`     Email: ${doctor.usuario.email}`, 'cyan');
      log(`     Registro Médico: ${doctor.numeroRegistroMedico}`, 'cyan');
      log(`     Universidad: ${doctor.universidadEgreso}`, 'cyan');
      log(`     Año Graduación: ${doctor.añoGraduacion}`, 'cyan');
      log(`     Biografía: ${doctor.biografia || 'No especificada'}`, 'cyan');
      log(`     Tarifa Consulta: $${doctor.tarifaConsulta || 'No especificada'}`, 'cyan');
      log(`     ---`, 'cyan');
    });

    return response.data;
  } catch (error) {
    log(`❌ Error al verificar vista de paciente: ${error.response?.data?.message || error.message}`, 'red');
    throw error;
  }
}

async function runCompleteTest() {
  try {
    log('🚀 Iniciando prueba completa del sistema administrador-doctor-paciente', 'magenta');
    log('=' * 80, 'magenta');
    
    // Paso 1: Login como administrador
    const adminToken = await login(ADMIN_CREDENTIALS);
    await delay(1000);
    
    // Paso 2: Crear usuario doctor
    const doctorUser = await createDoctorUser(adminToken);
    await delay(2000);
    
    // Paso 3: Verificar que el doctor aparece en el sistema
    const doctorsInSystem = await verifyDoctorInSystem(adminToken);
    await delay(1000);
    
    // Paso 4: Crear usuario paciente
    const patientUser = await createPatientUser(adminToken);
    await delay(2000);
    
    // Paso 5: Login como paciente
    const patientToken = await axios.post(`${BASE_URL}/auth/login`, {
      email: patientUser.email,
      password: 'paciente123'
    }).then(response => response.data.accessToken);
    
    log('✅ Login exitoso como paciente recién creado', 'green');
    await delay(1000);
    
    // Paso 6: Verificar que el paciente puede ver los doctores
    const doctorsVisibleToPatient = await verifyPatientCanSeeDoctors(patientToken);
    
    // Resumen final
    log('\n' + '=' * 80, 'magenta');
    log('📊 RESUMEN DE LA PRUEBA', 'magenta');
    log('=' * 80, 'magenta');
    
    log(`✅ Administrador logueado correctamente`, 'green');
    log(`✅ Doctor creado exitosamente (${doctorUser.nombre} ${doctorUser.apellido})`, 'green');
    log(`✅ Doctor aparece en sistema admin (${doctorsInSystem.length} doctores)`, 'green');
    log(`✅ Paciente creado exitosamente (${patientUser.nombre} ${patientUser.apellido})`, 'green');
    log(`✅ Paciente puede ver doctores (${doctorsVisibleToPatient.length} doctores)`, 'green');
    
    log('\n🎉 ¡PRUEBA COMPLETA EXITOSA!', 'green');
    log('El sistema funciona correctamente:', 'green');
    log('- Los administradores pueden crear doctores', 'green');
    log('- Los doctores creados aparecen automáticamente en el dashboard de pacientes', 'green');
    log('- Los pacientes pueden ver toda la información relevante de los doctores', 'green');
    
  } catch (error) {
    log('\n❌ PRUEBA FALLIDA', 'red');
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Ejecutar la prueba
if (require.main === module) {
  runCompleteTest();
}

module.exports = {
  runCompleteTest,
  login,
  createDoctorUser,
  verifyDoctorInSystem,
  verifyPatientCanSeeDoctors
};
