#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:4000';

// Credenciales de prueba
const ADMIN_CREDENTIALS = {
  email: 'admin@ortowhave.com',
  password: 'admin123'
};

const DOCTOR_CREDENTIALS = {
  email: 'doctor@ortowhave.com',  
  password: 'doctor123'
};

const PATIENT_CREDENTIALS = {
  email: 'paciente@ortowhave.com',
  password: 'paciente123'
};

let adminToken, doctorToken, patientToken;

async function testAllFeatures() {
  console.log('🧪 INICIANDO PRUEBAS COMPLETAS DEL SISTEMA ORTO-WHAVE');
  console.log('=' .repeat(60));

  try {
    // 1. Verificar que el servidor esté corriendo
    await testServerHealth();
    
    // 2. Probar autenticación
    await testAuthentication();
    
    // 3. Probar endpoints de usuarios
    await testUserEndpoints();
    
    // 4. Probar endpoints de citas
    await testAppointmentEndpoints();
    
    // 5. Probar endpoints de doctores
    await testDoctorEndpoints();
    
    // 6. Probar endpoints de pacientes
    await testPatientEndpoints();
    
    // 7. Probar dashboard
    await testDashboardEndpoints();
    
    // 8. Probar funcionalidades especiales
    await testSpecialFeatures();
    
    console.log('\n✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
    
  } catch (error) {
    console.error('\n❌ ERROR EN LAS PRUEBAS:', error.message);
    process.exit(1);
  }
}

async function testServerHealth() {
  console.log('\n🏥 1. VERIFICANDO SALUD DEL SERVIDOR');
  console.log('-'.repeat(40));
  
  try {
    // Test básico de conectividad
    const response = await axios.get(`${BASE_URL}/users/public/roles`, { timeout: 5000 });
    console.log('✅ Servidor respondiendo correctamente');
    console.log(`📊 Roles disponibles: ${response.data.length}`);
  } catch (error) {
    throw new Error(`Servidor no disponible: ${error.message}`);
  }
}

async function testAuthentication() {
  console.log('\n🔐 2. PROBANDO AUTENTICACIÓN');
  console.log('-'.repeat(40));
  
  try {
    // Login Admin
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    adminToken = adminLogin.data.token;
    console.log('✅ Login Admin exitoso');
    
    // Login Doctor  
    const doctorLogin = await axios.post(`${BASE_URL}/auth/login`, DOCTOR_CREDENTIALS);
    doctorToken = doctorLogin.data.token;
    console.log('✅ Login Doctor exitoso');
    
    // Login Paciente
    const patientLogin = await axios.post(`${BASE_URL}/auth/login`, PATIENT_CREDENTIALS);
    patientToken = patientLogin.data.token;
    console.log('✅ Login Paciente exitoso');
    
    // Verificar token admin
    const adminProfile = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✅ Perfil Admin: ${adminProfile.data.nombre} ${adminProfile.data.apellido}`);
    
  } catch (error) {
    throw new Error(`Error en autenticación: ${error.response?.data?.message || error.message}`);
  }
}

async function testUserEndpoints() {
  console.log('\n👥 3. PROBANDO ENDPOINTS DE USUARIOS');
  console.log('-'.repeat(40));
  
  try {
    const headers = { Authorization: `Bearer ${adminToken}` };
    
    // Obtener todos los usuarios
    const users = await axios.get(`${BASE_URL}/users/admin`, { headers });
    console.log(`✅ Usuarios obtenidos: ${users.data.length}`);
    
    // Obtener estadísticas
    const stats = await axios.get(`${BASE_URL}/users/admin/estadisticas`, { headers });
    console.log(`✅ Estadísticas: ${JSON.stringify(stats.data)}`);
    
    // Obtener usuarios por rol
    const doctors = await axios.get(`${BASE_URL}/users/admin/por-rol/doctor`, { headers });
    console.log(`✅ Doctores encontrados: ${doctors.data.length}`);
    
  } catch (error) {
    throw new Error(`Error en endpoints de usuarios: ${error.response?.data?.message || error.message}`);
  }
}

async function testAppointmentEndpoints() {
  console.log('\n📅 4. PROBANDO ENDPOINTS DE CITAS');
  console.log('-'.repeat(40));
  
  try {
    // Obtener citas del paciente
    const patientHeaders = { Authorization: `Bearer ${patientToken}` };
    const patientAppointments = await axios.get(`${BASE_URL}/citas/mis-citas`, { headers: patientHeaders });
    console.log(`✅ Citas del paciente: ${patientAppointments.data.length}`);
    
    // Obtener citas del doctor
    const doctorHeaders = { Authorization: `Bearer ${doctorToken}` };
    const doctorAppointments = await axios.get(`${BASE_URL}/citas/mis-citas`, { headers: doctorHeaders });
    console.log(`✅ Citas del doctor: ${doctorAppointments.data.length}`);
    
    // Buscar disponibilidad
    const availability = await axios.get(`${BASE_URL}/citas/disponibilidad`, {
      headers: patientHeaders,
      params: {
        doctorId: 2,
        fecha: '2025-07-27',
        duracion: 60
      }
    });
    console.log(`✅ Horarios disponibles: ${availability.data.length}`);
    
    // Citas pendientes de aprobación (admin)
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    const pendingAppointments = await axios.get(`${BASE_URL}/citas/pendientes-aprobacion`, { headers: adminHeaders });
    console.log(`✅ Citas pendientes: ${pendingAppointments.data.length}`);
    
  } catch (error) {
    throw new Error(`Error en endpoints de citas: ${error.response?.data?.message || error.message}`);
  }
}

async function testDoctorEndpoints() {
  console.log('\n👨‍⚕️ 5. PROBANDO ENDPOINTS DE DOCTORES');
  console.log('-'.repeat(40));
  
  try {
    const headers = { Authorization: `Bearer ${doctorToken}` };
    
    // Obtener perfil médico
    const profile = await axios.get(`${BASE_URL}/perfil-medico/mi-perfil`, { headers });
    console.log(`✅ Perfil médico: ${profile.data.especialidad}`);
    
    // Obtener doctores disponibles (público)
    const availableDoctors = await axios.get(`${BASE_URL}/perfil-medico/doctores-disponibles`, { headers });
    console.log(`✅ Doctores disponibles: ${availableDoctors.data.length}`);
    
  } catch (error) {
    throw new Error(`Error en endpoints de doctores: ${error.response?.data?.message || error.message}`);
  }
}

async function testPatientEndpoints() {
  console.log('\n🏥 6. PROBANDO ENDPOINTS DE PACIENTES');
  console.log('-'.repeat(40));
  
  try {
    const headers = { Authorization: `Bearer ${patientToken}` };
    
    // Obtener perfil de paciente
    try {
      const profile = await axios.get(`${BASE_URL}/pacientes/mi-perfil`, { headers });
      console.log(`✅ Perfil paciente obtenido`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('ℹ️ Perfil de paciente no existe (normal para usuarios nuevos)');
      } else {
        throw error;
      }
    }
    
    // Admin puede ver todos los pacientes
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    const patients = await axios.get(`${BASE_URL}/pacientes`, { headers: adminHeaders });
    console.log(`✅ Pacientes en sistema: ${patients.data.length}`);
    
  } catch (error) {
    throw new Error(`Error en endpoints de pacientes: ${error.response?.data?.message || error.message}`);
  }
}

async function testDashboardEndpoints() {
  console.log('\n📊 7. PROBANDO ENDPOINTS DE DASHBOARD');
  console.log('-'.repeat(40));
  
  try {
    // Dashboard de admin
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    const adminStats = await axios.get(`${BASE_URL}/dashboard/citas/estadisticas/admin`, { headers: adminHeaders });
    console.log(`✅ Estadísticas admin dashboard obtenidas`);
    
    // Dashboard de doctor
    const doctorHeaders = { Authorization: `Bearer ${doctorToken}` };
    const doctorStats = await axios.get(`${BASE_URL}/dashboard/citas/estadisticas`, { headers: doctorHeaders });
    console.log(`✅ Estadísticas doctor dashboard obtenidas`);
    
    // Dashboard de paciente
    const patientHeaders = { Authorization: `Bearer ${patientToken}` };
    const patientStats = await axios.get(`${BASE_URL}/dashboard/citas/estadisticas`, { headers: patientHeaders });
    console.log(`✅ Estadísticas paciente dashboard obtenidas`);
    
    // Doctores disponibles
    const availableDoctors = await axios.get(`${BASE_URL}/dashboard/citas/doctores-disponibles`, { headers: adminHeaders });
    console.log(`✅ Doctores disponibles dashboard: ${availableDoctors.data.length}`);
    
  } catch (error) {
    throw new Error(`Error en endpoints de dashboard: ${error.response?.data?.message || error.message}`);
  }
}

async function testSpecialFeatures() {
  console.log('\n⚡ 8. PROBANDO FUNCIONALIDADES ESPECIALES');
  console.log('-'.repeat(40));
  
  try {
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    
    // Estado del sistema
    const systemStatus = await axios.get(`${BASE_URL}/dashboard/citas/estado-sistema`, { headers: adminHeaders });
    console.log(`✅ Estado del sistema obtenido`);
    
    // Especialidades
    const specialties = await axios.get(`${BASE_URL}/dashboard/citas/especialidades`, { headers: adminHeaders });
    console.log(`✅ Especialidades: ${specialties.data.length}`);
    
    // Validar disponibilidad específica
    const validation = await axios.get(`${BASE_URL}/dashboard/citas/validar-disponibilidad`, {
      headers: adminHeaders,
      params: {
        doctorId: 2,
        fechaHora: '2025-07-27T10:00:00.000Z',
        duracion: 60
      }
    });
    console.log(`✅ Validación de disponibilidad: ${validation.data.disponible ? 'Disponible' : 'No disponible'}`);
    
  } catch (error) {
    throw new Error(`Error en funcionalidades especiales: ${error.response?.data?.message || error.message}`);
  }
}

// Ejecutar las pruebas
if (require.main === module) {
  testAllFeatures();
}

module.exports = { testAllFeatures };
