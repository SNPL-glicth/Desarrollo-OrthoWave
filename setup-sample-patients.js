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

async function createPatientProfile(profileData, token) {
  try {
    const response = await axios.post(`${BASE_URL}/pacientes`, profileData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear perfil de paciente:', error.response?.data || error.message);
    return null;
  }
}

async function checkExistingPatients(token) {
  try {
    const response = await axios.get(`${BASE_URL}/pacientes`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al verificar pacientes existentes:', error.response?.data || error.message);
    return [];
  }
}

async function setupSamplePatients() {
  console.log('🚀 Iniciando configuración de pacientes de muestra...');
  
  try {
    // 1. Login como admin
    console.log('📝 Haciendo login como administrador...');
    const token = await loginAsAdmin();
    console.log('✅ Login exitoso');

    // 2. Verificar pacientes existentes
    console.log('🔍 Verificando pacientes existentes...');
    const existingPatients = await checkExistingPatients(token);
    console.log(`📊 Pacientes existentes: ${existingPatients.length}`);

    if (existingPatients.length > 3) { // Asumiendo que ya existe el paciente demo
      console.log('ℹ️  Ya existen suficientes pacientes en el sistema');
      return;
    }

    // 3. Crear usuarios pacientes
    const patientUsers = [
      {
        nombre: 'María José',
        apellido: 'Rodríguez Martínez',
        email: 'maria.rodriguez@email.com',
        password: 'paciente123',
        telefono: '+57 310 123 4567',
        direccion: 'Calle 50 #12-34, Bogotá',
        rolId: 3 // ID del rol paciente
      },
      {
        nombre: 'Juan Carlos',
        apellido: 'López García',
        email: 'juan.lopez@email.com',
        password: 'paciente123',
        telefono: '+57 311 234 5678',
        direccion: 'Carrera 30 #45-67, Bogotá',
        rolId: 3
      },
      {
        nombre: 'Ana Sofía',
        apellido: 'Gómez Torres',
        email: 'ana.gomez@email.com',
        password: 'paciente123',
        telefono: '+57 312 345 6789',
        direccion: 'Avenida 19 #78-90, Bogotá',
        rolId: 3
      },
      {
        nombre: 'Carlos Andrés',
        apellido: 'Hernández Silva',
        email: 'carlos.hernandez@email.com',
        password: 'paciente123',
        telefono: '+57 313 456 7890',
        direccion: 'Calle 80 #23-45, Bogotá',
        rolId: 3
      },
      {
        nombre: 'Laura Patricia',
        apellido: 'Moreno Vásquez',
        email: 'laura.moreno@email.com',
        password: 'paciente123',
        telefono: '+57 314 567 8901',
        direccion: 'Carrera 60 #56-78, Bogotá',
        rolId: 3
      }
    ];

    console.log('👥 Creando usuarios pacientes...');
    const createdUsers = [];
    
    for (const userData of patientUsers) {
      console.log(`   Creando usuario: ${userData.nombre} ${userData.apellido}`);
      const user = await createUser(userData, token);
      if (user) {
        createdUsers.push(user);
        console.log(`   ✅ Usuario creado con ID: ${user.id}`);
      }
    }

    // 4. Crear perfiles de pacientes
    const patientProfiles = [
      {
        usuarioId: createdUsers[0]?.id,
        numeroIdentificacion: '52123456',
        tipoIdentificacion: 'CC',
        fechaNacimiento: '1985-03-15',
        genero: 'femenino',
        estadoCivil: 'casada',
        ocupacion: 'Ingeniera',
        ciudadResidencia: 'Bogotá',
        barrio: 'Chapinero',
        eps: 'Compensar',
        tipoAfiliacion: 'contributivo',
        contactoEmergenciaNombre: 'Pedro Rodríguez',
        contactoEmergenciaTelefono: '+57 300 987 6543',
        contactoEmergenciaParentesco: 'esposo',
        antecedentesMedicos: 'Hipertensión controlada',
        alergias: 'Penicilina',
        peso: 65.5,
        estatura: 1.65,
        grupoSanguineo: 'O+',
        activo: true,
        primeraConsulta: false
      },
      {
        usuarioId: createdUsers[1]?.id,
        numeroIdentificacion: '1023456789',
        tipoIdentificacion: 'CC',
        fechaNacimiento: '1992-07-22',
        genero: 'masculino',
        estadoCivil: 'soltero',
        ocupacion: 'Abogado',
        ciudadResidencia: 'Bogotá',
        barrio: 'Zona Rosa',
        eps: 'Sura',
        tipoAfiliacion: 'contributivo',
        contactoEmergenciaNombre: 'Carmen García',
        contactoEmergenciaTelefono: '+57 301 876 5432',
        contactoEmergenciaParentesco: 'madre',
        antecedentesMedicos: 'Ninguno conocido',
        alergias: 'Ninguna conocida',
        peso: 78.0,
        estatura: 1.75,
        grupoSanguineo: 'A+',
        activo: true,
        primeraConsulta: true
      },
      {
        usuarioId: createdUsers[2]?.id,
        numeroIdentificacion: '63789012',
        tipoIdentificacion: 'CC',
        fechaNacimiento: '1988-11-03',
        genero: 'femenino',
        estadoCivil: 'soltera',
        ocupacion: 'Diseñadora Gráfica',
        ciudadResidencia: 'Bogotá',
        barrio: 'La Candelaria',
        eps: 'Sanitas',
        tipoAfiliacion: 'contributivo',
        contactoEmergenciaNombre: 'Luis Gómez',
        contactoEmergenciaTelefono: '+57 302 765 4321',
        contactoEmergenciaParentesco: 'padre',
        antecedentesMedicos: 'Asma leve',
        alergias: 'Polen, ácaros',
        peso: 58.2,
        estatura: 1.60,
        grupoSanguineo: 'B+',
        activo: true,
        primeraConsulta: true
      },
      {
        usuarioId: createdUsers[3]?.id,
        numeroIdentificacion: '79012345',
        tipoIdentificacion: 'CC',
        fechaNacimiento: '1995-05-18',
        genero: 'masculino',
        estadoCivil: 'soltero',
        ocupacion: 'Estudiante',
        ciudadResidencia: 'Bogotá',
        barrio: 'Minuto de Dios',
        eps: 'Nueva EPS',
        tipoAfiliacion: 'contributivo',
        contactoEmergenciaNombre: 'Rosa Silva',
        contactoEmergenciaTelefono: '+57 303 654 3210',
        contactoEmergenciaParentesco: 'madre',
        antecedentesMedicos: 'Ninguno',
        alergias: 'Ninguna',
        peso: 70.5,
        estatura: 1.72,
        grupoSanguineo: 'AB+',
        activo: true,
        primeraConsulta: true
      },
      {
        usuarioId: createdUsers[4]?.id,
        numeroIdentificacion: '41567890',
        tipoIdentificacion: 'CC',
        fechaNacimiento: '1990-09-12',
        genero: 'femenino',
        estadoCivil: 'casada',
        ocupacion: 'Profesora',
        ciudadResidencia: 'Bogotá',
        barrio: 'Suba',
        eps: 'Cafesalud',
        tipoAfiliacion: 'contributivo',
        contactoEmergenciaNombre: 'Miguel Moreno',
        contactoEmergenciaTelefono: '+57 304 543 2109',
        contactoEmergenciaParentesco: 'esposo',
        antecedentesMedicos: 'Migraña ocasional',
        alergias: 'Mariscos',
        peso: 62.8,
        estatura: 1.68,
        grupoSanguineo: 'O-',
        activo: true,
        primeraConsulta: false
      }
    ];

    console.log('🏥 Creando perfiles de pacientes...');
    
    for (let i = 0; i < patientProfiles.length; i++) {
      if (createdUsers[i]) {
        console.log(`   Creando perfil de paciente para: ${createdUsers[i].nombre} ${createdUsers[i].apellido}`);
        const profile = await createPatientProfile(patientProfiles[i], token);
        if (profile) {
          console.log(`   ✅ Perfil creado exitosamente`);
        }
      }
    }

    // 5. Verificar resultado final
    console.log('🔍 Verificando pacientes creados...');
    const finalPatients = await checkExistingPatients(token);
    console.log(`🎉 ¡Configuración completada! Total de pacientes: ${finalPatients.length}`);

  } catch (error) {
    console.error('❌ Error en la configuración:', error.message);
  }
}

// Ejecutar script
setupSamplePatients();
