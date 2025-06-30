const axios = require('axios');

const API_BASE = 'http://localhost:4000';

async function testUserCreation() {
  console.log('🧪 Probando creación de usuarios específicos por administrador...\n');

  try {
    // 1. Primero login como admin
    console.log('1️⃣ Haciendo login como admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@ortowhave.com',
      password: 'admin123'
    });

    const adminToken = loginResponse.data.access_token;
    console.log('✅ Login exitoso, token obtenido\n');

    // 2. Obtener roles disponibles
    console.log('2️⃣ Obteniendo roles disponibles...');
    const rolesResponse = await axios.get(`${API_BASE}/users/public/roles`);
    console.log('✅ Roles disponibles:', rolesResponse.data);
    console.log('');

    // 3. Probar creación de usuario doctor
    console.log('3️⃣ Probando creación de usuario doctor...');
    const doctorData = {
      email: 'nuevo.doctor@ortowhave.com',
      password: 'doctor123',
      nombre: 'Doctor',
      apellido: 'Nuevo',
      telefono: '3001234567',
      direccion: 'Consultorio Principal',
      rolId: 2, // doctor
      perfilMedico: {
        numeroRegistroMedico: 'RM12345',
        especialidad: 'Ortopedia',
        universidadEgreso: 'Universidad Nacional',
        añoGraduacion: 2015,
        biografia: 'Doctor especialista en ortopedia',
        tarifaConsulta: 150000
      }
    };

    const createDoctorResponse = await axios.post(
      `${API_BASE}/users/admin/crear-usuario`,
      doctorData,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Doctor creado exitosamente:', {
      id: createDoctorResponse.data.id,
      email: createDoctorResponse.data.email,
      nombre: createDoctorResponse.data.nombre,
      apellido: createDoctorResponse.data.apellido
    });
    console.log('');

    // 4. Probar creación de usuario paciente
    console.log('4️⃣ Probando creación de usuario paciente...');
    const pacienteData = {
      email: 'nuevo.paciente@ortowhave.com',
      password: 'paciente123',
      nombre: 'Paciente',
      apellido: 'Nuevo',
      telefono: '3007654321',
      direccion: 'Dirección del paciente',
      rolId: 3, // paciente
      perfilPaciente: {
        numeroIdentificacion: '1234567890',
        tipoIdentificacion: 'CC',
        fechaNacimiento: '1990-05-15',
        genero: 'masculino',
        eps: 'Sura'
      }
    };

    const createPacienteResponse = await axios.post(
      `${API_BASE}/users/admin/crear-usuario`,
      pacienteData,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Paciente creado exitosamente:', {
      id: createPacienteResponse.data.id,
      email: createPacienteResponse.data.email,
      nombre: createPacienteResponse.data.nombre,
      apellido: createPacienteResponse.data.apellido
    });
    console.log('');

    // 5. Verificar usuarios creados
    console.log('5️⃣ Verificando usuarios creados...');
    const usersResponse = await axios.get(
      `${API_BASE}/users/admin/todos`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      }
    );

    console.log('✅ Total de usuarios en el sistema:', usersResponse.data.length);
    console.log('');

    console.log('🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
    console.log('✅ La funcionalidad de creación de usuarios específicos por administrador está funcionando correctamente.');

  } catch (error) {
    console.error('❌ ERROR EN LA PRUEBA:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request error:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    console.error('Full error:', error);
  }
}

// Ejecutar prueba
testUserCreation();
