const axios = require('axios');

// Configuración de la API
const API_BASE_URL = 'http://localhost:4000';

// Función para probar el login con diferentes usuarios
async function testUserWithCitas() {
  console.log('🧪 Probando usuarios que tienen citas en la base de datos...\n');
  
  // Según la DB, los usuarios con citas son:
  // - Usuario 11: Ana Sofía Gómez Torres (paciente)
  // - Usuario 10: Juan Carlos López García (paciente)
  // - Usuario 13: Laura Patricia Moreno Vásquez (paciente)
  // - Usuario 4: Carlos Eduardo Gómez Rodríguez (doctor)
  // - Usuario 6: Roberto Martínez López (doctor)
  // - Usuario 8: Miguel Ángel Herrera Castro (doctor)
  
  // Primero, probemos con el usuario 11 que tiene 2 citas
  console.log('🔍 Probando consulta directa al endpoint de citas del usuario 11...');
  try {
    // Necesitamos hacer login como admin para acceder a los datos de otros usuarios
    const adminLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@ortowhave.com',
      password: 'admin123'
    });
    
    const headers = {
      'Authorization': `Bearer ${adminLogin.data.access_token}`,
      'Content-Type': 'application/json'
    };
    
    // Probar endpoint de paciente 11
    console.log('📋 Consultando citas del paciente 11...');
    const paciente11Response = await axios.get(`${API_BASE_URL}/citas/paciente/11`, { headers });
    console.log('✅ Citas del paciente 11:', JSON.stringify(paciente11Response.data, null, 2));
    
    // Probar endpoint de doctor 4
    console.log('📋 Consultando citas del doctor 4...');
    const doctor4Response = await axios.get(`${API_BASE_URL}/citas/doctor/4`, { headers });
    console.log('✅ Citas del doctor 4:', JSON.stringify(doctor4Response.data, null, 2));
    
    // Probar endpoint de doctor 6
    console.log('📋 Consultando citas del doctor 6...');
    const doctor6Response = await axios.get(`${API_BASE_URL}/citas/doctor/6`, { headers });
    console.log('✅ Citas del doctor 6:', JSON.stringify(doctor6Response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Función para crear citas de prueba para los usuarios principales
async function createTestCitasForMainUsers() {
  console.log('🧪 Creando citas de prueba para usuarios principales...\n');
  
  try {
    // Login como admin para crear citas
    const adminLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@ortowhave.com',
      password: 'admin123'
    });
    
    const headers = {
      'Authorization': `Bearer ${adminLogin.data.access_token}`,
      'Content-Type': 'application/json'
    };
    
    // Crear cita para paciente 3 con doctor 2
    console.log('📝 Creando cita para paciente 3 con doctor 2...');
    const cita1 = await axios.post(`${API_BASE_URL}/citas`, {
      pacienteId: 3,
      doctorId: 2,
      fechaHora: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // mañana
      duracion: 60,
      tipoConsulta: 'primera_vez',
      motivoConsulta: 'Consulta de prueba para el dashboard',
      notasPaciente: 'Cita creada para probar el dashboard'
    }, { headers });
    
    console.log('✅ Cita creada:', cita1.data);
    
    // Crear cita para paciente 3 con doctor 14
    console.log('📝 Creando cita para paciente 3 con doctor 14...');
    const cita2 = await axios.post(`${API_BASE_URL}/citas`, {
      pacienteId: 3,
      doctorId: 14,
      fechaHora: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // pasado mañana
      duracion: 60,
      tipoConsulta: 'control',
      motivoConsulta: 'Consulta de seguimiento',
      notasPaciente: 'Segunda cita para probar el dashboard'
    }, { headers });
    
    console.log('✅ Cita creada:', cita2.data);
    
    // Ahora probar que las citas aparecen para el paciente 3
    console.log('🔍 Verificando que las citas aparecen para el paciente 3...');
    const pacienteLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'paciente@ortowhave.com',
      password: 'paciente123'
    });
    
    const pacienteHeaders = {
      'Authorization': `Bearer ${pacienteLogin.data.access_token}`,
      'Content-Type': 'application/json'
    };
    
    const misCitas = await axios.get(`${API_BASE_URL}/citas/mis-citas`, { headers: pacienteHeaders });
    console.log('✅ Mis citas del paciente 3:', JSON.stringify(misCitas.data, null, 2));
    
    // Probar que las citas aparecen para el doctor 2
    console.log('🔍 Verificando que las citas aparecen para el doctor 2...');
    const doctorLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'doctor@ortowhave.com',
      password: 'doctor123'
    });
    
    const doctorHeaders = {
      'Authorization': `Bearer ${doctorLogin.data.access_token}`,
      'Content-Type': 'application/json'
    };
    
    const citasDoctor = await axios.get(`${API_BASE_URL}/citas/mis-citas`, { headers: doctorHeaders });
    console.log('✅ Mis citas del doctor 2:', JSON.stringify(citasDoctor.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status === 409) {
      console.log('ℹ️  El error 409 puede indicar que ya existe una cita en ese horario');
    }
  }
}

// Función principal
async function main() {
  try {
    await testUserWithCitas();
    await createTestCitasForMainUsers();
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

main();
