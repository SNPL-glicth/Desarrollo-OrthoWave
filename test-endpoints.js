#!/usr/bin/env node

// Script para testear los endpoints del dashboard
const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// Credenciales de prueba
const ADMIN_CREDENTIALS = {
  email: 'admin@ortowhave.com',
  password: 'admin123'
};

async function testEndpoints() {
  console.log('🔍 Testeando endpoints del dashboard...\n');
  
  try {
    // 1. Login como admin
    console.log('1. Iniciando sesión como administrador...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso\n');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // 2. Testear endpoint de estadísticas de usuarios
    console.log('2. Testeando /users/admin/estadisticas...');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/users/admin/estadisticas`, { headers });
      console.log('✅ Estadísticas obtenidas:', JSON.stringify(statsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Error en estadísticas:', error.response?.data || error.message);
    }
    console.log('');
    
    // 3. Testear endpoint de usuarios
    console.log('3. Testeando /users/admin...');
    try {
      const usersResponse = await axios.get(`${BASE_URL}/users/admin`, { headers });
      console.log('✅ Usuarios obtenidos:', `${usersResponse.data.length} usuarios encontrados`);
    } catch (error) {
      console.log('❌ Error en usuarios:', error.response?.data || error.message);
    }
    console.log('');
    
    // 4. Testear endpoint de dashboard de citas
    console.log('4. Testeando /dashboard/citas/estadisticas...');
    try {
      const citasStatsResponse = await axios.get(`${BASE_URL}/dashboard/citas/estadisticas`, { headers });
      console.log('✅ Estadísticas de citas obtenidas:', JSON.stringify(citasStatsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Error en estadísticas de citas:', error.response?.data || error.message);
    }
    console.log('');
    
    // 5. Testear endpoint de agenda doctor (solo si hay un doctor)
    console.log('5. Testeando /dashboard/citas/agenda-doctor...');
    try {
      const agendaResponse = await axios.get(`${BASE_URL}/dashboard/citas/agenda-doctor`, { headers });
      console.log('✅ Agenda de doctor obtenida:', JSON.stringify(agendaResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Error en agenda doctor:', error.response?.data || error.message);
    }
    console.log('');
    
    console.log('🎉 Testing completo!');
    
  } catch (error) {
    console.error('❌ Error general:', error.response?.data || error.message);
  }
}

// Ejecutar el test
testEndpoints();
