const axios = require('axios');

// Configuración de la API
const API_BASE_URL = 'http://localhost:4000';

// Función para probar el login
async function testLogin() {
  console.log('🔐 Probando login...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@ortowhave.com',
      password: 'admin123'
    });
    
    console.log('✅ Login exitoso');
    console.log('Usuario:', response.data.user);
    console.log('Token:', response.data.access_token ? 'Token generado' : 'No hay token');
    return response.data;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    throw error;
  }
}

// Función para probar el endpoint de citas
async function testCitas(token, userId, userRole) {
  console.log(`\n📋 Probando citas para usuario ${userId} con rol ${userRole}...`);
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  try {
    let endpoint;
    if (userRole === 'doctor') {
      endpoint = `/citas/doctor/${userId}`;
    } else if (userRole === 'paciente') {
      endpoint = `/citas/paciente/${userId}`;
    } else {
      endpoint = '/citas/mis-citas';
    }
    
    console.log(`🔍 Consultando endpoint: ${endpoint}`);
    
    const response = await axios.get(`${API_BASE_URL}${endpoint}`, { headers });
    
    console.log('✅ Respuesta exitosa');
    console.log('Número de citas:', response.data.length);
    console.log('Citas:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener citas:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
    return [];
  }
}

// Función para probar el endpoint mis-citas
async function testMisCitas(token) {
  console.log('\n📋 Probando endpoint mis-citas...');
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  try {
    const response = await axios.get(`${API_BASE_URL}/citas/mis-citas`, { headers });
    
    console.log('✅ Mis citas - respuesta exitosa');
    console.log('Número de citas:', response.data.length);
    console.log('Citas:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener mis citas:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    return [];
  }
}

// Función para probar diferentes usuarios
async function testMultipleUsers() {
  console.log('🧪 Probando con múltiples usuarios...\n');
  
  const testUsers = [
    { email: 'paciente@ortowhave.com', password: 'paciente123' },
    { email: 'doctor@ortowhave.com', password: 'doctor123' },
    { email: 'doctor.principal@ortowhave.com', password: 'doctor123' }
  ];
  
  for (const user of testUsers) {
    try {
      console.log(`\n👤 Probando usuario: ${user.email}`);
      
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, user);
      const userData = loginResponse.data;
      
      console.log('✅ Login exitoso');
      console.log('Usuario:', userData.user);
      
      // Probar citas específicas
      await testCitas(userData.access_token, userData.user.id, userData.user.rol?.nombre || userData.user.rol);
      
      // Probar mis-citas
      await testMisCitas(userData.access_token);
      
    } catch (error) {
      console.error(`❌ Error con usuario ${user.email}:`, error.response?.data || error.message);
    }
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 Iniciando pruebas de API de citas...');
    
    // Verificar que el servidor esté corriendo
    try {
      await axios.get(`${API_BASE_URL}/auth/me`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.error('❌ El servidor no está corriendo. Inicia el backend primero.');
        process.exit(1);
      }
    }
    
    // Probar con usuario principal
    const loginData = await testLogin();
    await testCitas(loginData.access_token, loginData.user.id, loginData.user.rol?.nombre || loginData.user.rol);
    await testMisCitas(loginData.access_token);
    
    // Probar con múltiples usuarios
    await testMultipleUsers();
    
    console.log('\n✅ Pruebas completadas');
    
  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error.message);
    process.exit(1);
  }
}

main();
