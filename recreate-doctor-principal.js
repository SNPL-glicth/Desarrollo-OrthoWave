#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// Función para hacer login como admin
async function loginAsAdmin() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@ortowhave.com',
      password: 'admin123'
    });
    
    if (response.data.token) {
      console.log('✅ Login como administrador exitoso');
      return response.data.token;
    } else {
      throw new Error('No se recibió token de autenticación');
    }
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data?.message || error.message);
    throw error;
  }
}

// Función para crear doctor principal
async function crearDoctorPrincipal(token) {
  try {
    const doctorData = {
      nombre: 'Dr. Juan Carlos',
      apellido: 'Médico Principal',
      email: 'doctor.principal@ortowhave.com',
      password: 'doctor123',
      telefono: '3009999999',
      direccion: 'Consultorio Principal #123',
      rolId: 2, // Doctor
      perfilMedico: {
        especialidad: 'Medicina General',
        numeroRegistroMedico: 'RM-2024-001',
        universidadEgreso: 'Universidad Nacional de Colombia',
        añoGraduacion: 2015,
        biografia: 'Médico especialista en Medicina General con 10 años de experiencia. Especializado en consultas de medicina interna, medicina preventiva y seguimiento de pacientes crónicos.',
        tarifaConsulta: 80000,
        aceptaNuevosPacientes: true,
        duracionConsultaDefault: 45,
        activo: true,
        subespecialidades: ['Medicina Interna', 'Medicina Preventiva'],
        ciudadAtencion: 'Bogotá',
        diasAtencion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
        horaInicio: '08:00',
        horaFin: '17:00',
        horaAlmuerzoInicio: '12:00',
        horaAlmuerzoFin: '13:00'
      }
    };

    const response = await axios.post(`${BASE_URL}/users/admin/crear-usuario`, doctorData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data) {
      console.log('✅ Doctor principal creado exitosamente');
      console.log(`   - ID: ${response.data.id}`);
      console.log(`   - Nombre: ${response.data.nombre} ${response.data.apellido}`);
      console.log(`   - Email: ${response.data.email}`);
      console.log(`   - Rol: ${response.data.rol?.nombre}`);
      
      if (response.data.perfilMedico) {
        console.log(`   - Perfil Médico ID: ${response.data.perfilMedico.id}`);
        console.log(`   - Especialidad: ${response.data.perfilMedico.especialidad}`);
        console.log(`   - Registro Médico: ${response.data.perfilMedico.numeroRegistroMedico}`);
      }
      
      return response.data;
    } else {
      throw new Error('No se recibió respuesta del servidor');
    }
  } catch (error) {
    console.error('❌ Error al crear doctor:', error.response?.data?.message || error.message);
    throw error;
  }
}

// Función para verificar doctores disponibles
async function verificarDoctoresDisponibles(token) {
  try {
    const response = await axios.get(`${BASE_URL}/perfil-medico/doctores-disponibles`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n📋 Doctores disponibles:');
    if (response.data && response.data.length > 0) {
      response.data.forEach(doctor => {
        console.log(`   - ${doctor.usuario.nombre} ${doctor.usuario.apellido}`);
        console.log(`     Email: ${doctor.usuario.email}`);
        console.log(`     Especialidad: ${doctor.especialidad}`);
        console.log(`     Tarifa: $${doctor.tarifaConsulta?.toLocaleString()} COP`);
        console.log(`     Acepta nuevos pacientes: ${doctor.aceptaNuevosPacientes ? 'Sí' : 'No'}`);
        console.log('');
      });
    } else {
      console.log('   - No hay doctores disponibles');
    }
  } catch (error) {
    console.error('❌ Error al verificar doctores:', error.response?.data?.message || error.message);
  }
}

// Función principal
async function main() {
  console.log('🏥 Recreando doctor principal...');
  
  try {
    // 1. Login como admin
    console.log('\n1. Iniciando sesión como administrador...');
    const token = await loginAsAdmin();
    
    // 2. Crear doctor principal
    console.log('\n2. Creando doctor principal...');
    const doctor = await crearDoctorPrincipal(token);
    
    // 3. Verificar doctores disponibles
    console.log('\n3. Verificando doctores disponibles...');
    await verificarDoctoresDisponibles(token);
    
    console.log('\n🎉 Doctor principal recreado exitosamente!');
    console.log('\n📝 Credenciales del doctor principal:');
    console.log('   - Email: doctor.principal@ortowhave.com');
    console.log('   - Contraseña: doctor123');
    
  } catch (error) {
    console.error('\n❌ Error durante la recreación:', error.message);
    process.exit(1);
  }
}

// Ejecutar
main();
