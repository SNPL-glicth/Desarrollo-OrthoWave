const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// Credenciales de admin (asumiendo que ya existe)
const ADMIN_CREDENTIALS = {
  email: 'admin@ortowhave.com',
  password: 'admin123'
};

async function loginAsAdmin() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    return response.data.access_token;
  } catch (error) {
    console.error('Error al hacer login como admin:', error.response?.data || error.message);
    throw error;
  }
}

async function createUser(userData, token) {
  try {
    const response = await axios.post(`${BASE_URL}/users/admin/crear-usuario`, userData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear usuario:', error.response?.data || error.message);
    return null;
  }
}

async function createMedicalProfile(profileData, token) {
  try {
    const response = await axios.post(`${BASE_URL}/perfil-medico`, profileData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear perfil médico:', error.response?.data || error.message);
    return null;
  }
}

async function checkExistingDoctors(token) {
  try {
    const response = await axios.get(`${BASE_URL}/perfil-medico/doctores-disponibles`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al verificar doctores existentes:', error.response?.data || error.message);
    return [];
  }
}

async function setupSampleDoctors() {
  console.log('🚀 Iniciando configuración de doctores de muestra...');
  
  try {
    // 1. Login como admin
    console.log('📝 Haciendo login como administrador...');
    const token = await loginAsAdmin();
    console.log('✅ Login exitoso');

    // 2. Verificar doctores existentes
    console.log('🔍 Verificando doctores existentes...');
    const existingDoctors = await checkExistingDoctors(token);
    console.log(`📊 Doctores existentes: ${existingDoctors.length}`);

    if (existingDoctors.length > 0) {
      console.log('ℹ️  Ya existen doctores en el sistema:');
      existingDoctors.forEach(doctor => {
        console.log(`   - Dr. ${doctor.usuario?.nombre} ${doctor.usuario?.apellido} (${doctor.especialidad})`);
      });
      return;
    }

    // 3. Crear usuarios doctores
    const doctorUsers = [
      {
        nombre: 'Carlos Eduardo',
        apellido: 'Gómez Rodríguez',
        email: 'carlos.gomez@ortowhave.com',
        password: 'doctor123',
        telefono: '+57 300 123 4567',
        direccion: 'Carrera 15 #85-32, Bogotá',
        rolId: 2 // ID del rol doctor
      },
      {
        nombre: 'Ana María',
        apellido: 'Pérez Silva',
        email: 'ana.perez@ortowhave.com',
        password: 'doctor123',
        telefono: '+57 301 234 5678',
        direccion: 'Calle 100 #15-25, Bogotá',
        rolId: 2
      },
      {
        nombre: 'Roberto',
        apellido: 'Martínez López',
        email: 'roberto.martinez@ortowhave.com',
        password: 'doctor123',
        telefono: '+57 302 345 6789',
        direccion: 'Avenida 68 #45-12, Bogotá',
        rolId: 2
      },
      {
        nombre: 'Laura',
        apellido: 'González Torres',
        email: 'laura.gonzalez@ortowhave.com',
        password: 'doctor123',
        telefono: '+57 303 456 7890',
        direccion: 'Calle 72 #10-34, Bogotá',
        rolId: 2
      },
      {
        nombre: 'Miguel Ángel',
        apellido: 'Herrera Castro',
        email: 'miguel.herrera@ortowhave.com',
        password: 'doctor123',
        telefono: '+57 304 567 8901',
        direccion: 'Carrera 11 #93-56, Bogotá',
        rolId: 2
      }
    ];

    console.log('👥 Creando usuarios doctores...');
    const createdUsers = [];
    
    for (const userData of doctorUsers) {
      console.log(`   Creando usuario: ${userData.nombre} ${userData.apellido}`);
      const user = await createUser(userData, token);
      if (user) {
        createdUsers.push(user);
        console.log(`   ✅ Usuario creado con ID: ${user.id}`);
      }
    }

    // 4. Crear perfiles médicos
    const medicalProfiles = [
      {
        usuarioId: createdUsers[0]?.id,
        numeroRegistroMedico: 'RM-001-2024',
        especialidad: 'Cardiología',
        subespecialidades: ['Cardiología Interventiva', 'Electrofisiología'],
        universidadEgreso: 'Universidad Nacional de Colombia',
        añoGraduacion: 2010,
        biografia: 'Especialista en cardiología con más de 10 años de experiencia en el diagnóstico y tratamiento de enfermedades cardiovasculares.',
        aceptaNuevosPacientes: true,
        tarifaConsulta: 150000,
        duracionConsultaDefault: 60,
        telefonoConsultorio: '+57 1 234 5678',
        direccionConsultorio: 'Carrera 15 #85-32, Consultorio 501, Bogotá',
        ciudad: 'Bogotá',
        diasAtencion: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
        horaInicio: '08:00',
        horaFin: '18:00',
        horaAlmuerzoInicio: '12:00',
        horaAlmuerzoFin: '13:00',
        activo: true,
        verificadoColegio: true
      },
      {
        usuarioId: createdUsers[1]?.id,
        numeroRegistroMedico: 'RM-002-2024',
        especialidad: 'Dermatología',
        subespecialidades: ['Dermatología Cosmética', 'Dermatología Oncológica'],
        universidadEgreso: 'Universidad Javeriana',
        añoGraduacion: 2012,
        biografia: 'Dermatóloga especializada en tratamientos cosméticos y oncología cutánea con amplia experiencia.',
        aceptaNuevosPacientes: true,
        tarifaConsulta: 120000,
        duracionConsultaDefault: 45,
        telefonoConsultorio: '+57 1 345 6789',
        direccionConsultorio: 'Calle 100 #15-25, Torre Médica, Piso 8, Bogotá',
        ciudad: 'Bogotá',
        diasAtencion: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
        horaInicio: '09:00',
        horaFin: '17:00',
        horaAlmuerzoInicio: '12:30',
        horaAlmuerzoFin: '13:30',
        activo: true,
        verificadoColegio: true
      },
      {
        usuarioId: createdUsers[2]?.id,
        numeroRegistroMedico: 'RM-003-2024',
        especialidad: 'Ortodoncia',
        subespecialidades: ['Ortodoncia Invisible', 'Ortodoncia Interceptiva'],
        universidadEgreso: 'Universidad El Bosque',
        añoGraduacion: 2008,
        biografia: 'Ortodoncista especializado en tratamientos estéticos y funcionales para todas las edades.',
        aceptaNuevosPacientes: true,
        tarifaConsulta: 100000,
        duracionConsultaDefault: 45,
        telefonoConsultorio: '+57 1 456 7890',
        direccionConsultorio: 'Avenida 68 #45-12, Centro Odontológico, Bogotá',
        ciudad: 'Bogotá',
        diasAtencion: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
        horaInicio: '08:30',
        horaFin: '17:30',
        horaAlmuerzoInicio: '12:00',
        horaAlmuerzoFin: '13:00',
        activo: true,
        verificadoColegio: true
      },
      {
        usuarioId: createdUsers[3]?.id,
        numeroRegistroMedico: 'RM-004-2024',
        especialidad: 'Pediatría',
        subespecialidades: ['Pediatría General', 'Neonatología'],
        universidadEgreso: 'Universidad de La Sabana',
        añoGraduacion: 2015,
        biografia: 'Pediatra con experiencia en el cuidado integral de niños desde el nacimiento hasta la adolescencia.',
        aceptaNuevosPacientes: true,
        tarifaConsulta: 110000,
        duracionConsultaDefault: 30,
        telefonoConsultorio: '+57 1 567 8901',
        direccionConsultorio: 'Calle 72 #10-34, Clínica Infantil, Bogotá',
        ciudad: 'Bogotá',
        diasAtencion: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
        horaInicio: '07:00',
        horaFin: '16:00',
        horaAlmuerzoInicio: '11:30',
        horaAlmuerzoFin: '12:30',
        activo: true,
        verificadoColegio: true
      },
      {
        usuarioId: createdUsers[4]?.id,
        numeroRegistroMedico: 'RM-005-2024',
        especialidad: 'Neurología',
        subespecialidades: ['Neurología Clínica', 'Epileptología'],
        universidadEgreso: 'Universidad Militar Nueva Granada',
        añoGraduacion: 2009,
        biografia: 'Neurólogo especializado en el diagnóstico y tratamiento de trastornos del sistema nervioso.',
        aceptaNuevosPacientes: true,
        tarifaConsulta: 180000,
        duracionConsultaDefault: 60,
        telefonoConsultorio: '+57 1 678 9012',
        direccionConsultorio: 'Carrera 11 #93-56, Centro Neurológico, Bogotá',
        ciudad: 'Bogotá',
        diasAtencion: ['lunes', 'martes', 'miércoles', 'jueves'],
        horaInicio: '09:00',
        horaFin: '18:00',
        horaAlmuerzoInicio: '13:00',
        horaAlmuerzoFin: '14:00',
        activo: true,
        verificadoColegio: true
      }
    ];

    console.log('🏥 Creando perfiles médicos...');
    
    for (let i = 0; i < medicalProfiles.length; i++) {
      if (createdUsers[i]) {
        console.log(`   Creando perfil médico para: ${createdUsers[i].nombre} ${createdUsers[i].apellido}`);
        const profile = await createMedicalProfile(medicalProfiles[i], token);
        if (profile) {
          console.log(`   ✅ Perfil creado: ${medicalProfiles[i].especialidad}`);
        }
      }
    }

    // 5. Verificar resultado final
    console.log('🔍 Verificando doctores creados...');
    const finalDoctors = await checkExistingDoctors(token);
    console.log(`🎉 ¡Configuración completada! Total de doctores disponibles: ${finalDoctors.length}`);
    
    if (finalDoctors.length > 0) {
      console.log('📋 Doctores disponibles:');
      finalDoctors.forEach(doctor => {
        console.log(`   - Dr. ${doctor.usuario?.nombre} ${doctor.usuario?.apellido} (${doctor.especialidad})`);
      });
    }

  } catch (error) {
    console.error('❌ Error en la configuración:', error.message);
  }
}

// Ejecutar script
setupSampleDoctors();
