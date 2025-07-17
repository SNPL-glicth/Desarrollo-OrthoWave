#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'http://localhost:4000';

async function testLogin() {
  console.log('🧪 Probando login con credenciales correctas...\n');
  
  const testUser = {
    email: 'admin@ortowhave.com',
    password: 'admin123'
  };
  
  try {
    console.log(`📧 Email: ${testUser.email}`);
    console.log(`🔑 Password: ${testUser.password}`);
    console.log('🔄 Enviando solicitud de login...\n');
    
    const response = await axios.post(`${API_URL}/auth/login`, testUser, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Login exitoso!');
    console.log('📄 Respuesta completa:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.user) {
      console.log('\n👤 Datos del usuario:');
      console.log(`- ID: ${response.data.user.id}`);
      console.log(`- Email: ${response.data.user.email}`);
      console.log(`- Nombre: ${response.data.user.nombre} ${response.data.user.apellido}`);
      console.log(`- Rol: ${response.data.user.rol}`);
      
      if (response.data.redirect) {
        console.log(`🔄 Ruta de redirección: ${response.data.redirect}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Error en el login:');
    
    if (error.response) {
      console.log(`- Status: ${error.response.status}`);
      console.log(`- Status Text: ${error.response.statusText}`);
      console.log('- Datos de error:');
      console.log(JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('- Error de red: No se pudo conectar con el servidor');
      console.log(`- URL intentada: ${API_URL}/auth/login`);
    } else {
      console.log(`- Error: ${error.message}`);
    }
  }
}

// Verificar si el servidor está ejecutándose
async function checkServer() {
  try {
    console.log('🔍 Verificando si el servidor está activo...');
    const response = await axios.get(`${API_URL}/auth/login`);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('✅ Servidor activo (404 esperado para GET en /auth/login)\n');
      return true;
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Error: El servidor backend no está ejecutándose en puerto 4000');
      console.log('   Por favor inicia el servidor con: npm run start:dev en la carpeta backend');
      process.exit(1);
    }
  }
  return true;
}

async function main() {
  await checkServer();
  await testLogin();
}

main().catch(console.error);
