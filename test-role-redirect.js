#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'http://localhost:4000';

// Credenciales de prueba para diferentes roles
const testUsers = [
  {
    email: 'admin@ortowhite.com',
    password: 'admin123',
    expectedRole: 'admin',
    expectedRedirect: '/dashboard/admin'
  },
  {
    email: 'doctor@ortowhite.com', 
    password: 'doctor123',
    expectedRole: 'doctor',
    expectedRedirect: '/dashboard/doctor'
  },
  {
    email: 'paciente@ortowhite.com',
    password: 'paciente123', 
    expectedRole: 'paciente',
    expectedRedirect: '/dashboard/patient'
  }
];

async function testLogin(user) {
  try {
    console.log(`\n🔍 Probando login para ${user.email}...`);
    
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: user.email,
      password: user.password
    });

    if (response.data && response.data.user) {
      const { user: userData, redirect } = response.data;
      
      console.log(`✅ Login exitoso:`);
      console.log(`   - Email: ${userData.email}`);
      console.log(`   - Nombre: ${userData.nombre} ${userData.apellido}`);
      console.log(`   - Rol obtenido: ${userData.rol}`);
      console.log(`   - Rol esperado: ${user.expectedRole}`);
      console.log(`   - Redirección obtenida: ${redirect || 'No definida'}`);
      console.log(`   - Redirección esperada: ${user.expectedRedirect}`);
      
      // Verificar rol
      if (userData.rol === user.expectedRole) {
        console.log(`   ✅ Rol correcto`);
      } else {
        console.log(`   ❌ Rol incorrecto`);
      }
      
      // Verificar redirección
      if (redirect === user.expectedRedirect) {
        console.log(`   ✅ Redirección correcta`);
      } else {
        console.log(`   ❌ Redirección incorrecta`);
      }
      
    } else {
      console.log(`❌ Respuesta inválida del servidor`);
    }
    
  } catch (error) {
    if (error.response) {
      console.log(`❌ Error ${error.response.status}: ${error.response.data.message || 'Error desconocido'}`);
    } else if (error.request) {
      console.log(`❌ Error de conexión: No se pudo conectar con el servidor`);
    } else {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

async function testAllUsers() {
  console.log('🚀 Iniciando pruebas de login y redirección por roles...\n');
  
  for (const user of testUsers) {
    await testLogin(user);
    // Pequeña pausa entre pruebas
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n✨ Pruebas completadas');
}

// Verificar si el servidor está ejecutándose
async function checkServer() {
  try {
    await axios.get(`${API_URL}/auth/login`);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Endpoint no encontrado es esperado para GET en /auth/login
      return true;
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Error: El servidor backend no está ejecutándose en puerto 4000');
      console.log('   Por favor inicia el servidor con: npm run start:dev en la carpeta backend');
      process.exit(1);
    }
  }
  return true;
}

// Ejecutar pruebas
async function main() {
  await checkServer();
  await testAllUsers();
}

main().catch(console.error);
