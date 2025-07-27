const axios = require('axios');

// URL base del backend
const BASE_URL = 'http://localhost:4000';

// Función para probar el endpoint de citas
async function testCitasEndpoint() {
  try {
    console.log('🔍 Probando endpoints del backend...\n');
    
    // Test 1: Verificar que el servidor esté corriendo
    console.log('1. Verificando servidor...');
    try {
      const response = await axios.get(`${BASE_URL}`, { timeout: 5000 });
      console.log('✅ Servidor está corriendo');
    } catch (error) {
      console.log('❌ Servidor no está corriendo o no responde');
      console.log('Error:', error.message);
      return;
    }

    // Test 2: Verificar endpoint de perfil médico (sin autenticación)
    console.log('\n2. Verificando endpoint de doctores disponibles...');
    try {
      const response = await axios.get(`${BASE_URL}/perfil-medico/doctores-disponibles`, { timeout: 5000 });
      console.log('✅ Endpoint de doctores disponibles funciona');
      console.log('Doctores encontrados:', response.data.length);
    } catch (error) {
      console.log('⚠️ Endpoint de doctores disponibles no responde correctamente');
      console.log('Error:', error.response?.status, error.response?.data?.message || error.message);
    }

    // Test 3: Verificar que los endpoints de citas requieren autenticación
    console.log('\n3. Verificando autenticación en endpoints de citas...');
    try {
      const response = await axios.get(`${BASE_URL}/citas/mis-citas`, { timeout: 5000 });
      console.log('⚠️ Endpoint de citas no requiere autenticación (problema de seguridad)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Endpoint de citas requiere autenticación correctamente');
      } else {
        console.log('❌ Error inesperado:', error.response?.status, error.message);
      }
    }

    console.log('\n🎉 Pruebas completadas');
    
  } catch (error) {
    console.error('❌ Error general en las pruebas:', error.message);
  }
}

// Ejecutar las pruebas
testCitasEndpoint();
