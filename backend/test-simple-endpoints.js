#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:4000';

async function testSimplifiedEndpoints() {
  console.log('🧪 PROBANDO ENDPOINTS SIMPLIFICADOS');
  console.log('=' .repeat(50));

  try {
    // 1. Probar registro simplificado de paciente
    console.log('\n👤 1. REGISTRO SIMPLIFICADO DE PACIENTE');
    console.log('-'.repeat(40));
    
    const newPatient = {
      nombre: 'Juan Carlos',
      email: 'juan.carlos@email.com',
      password: 'password123',
      telefono: '3001234567'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register-patient`, newPatient);
      console.log('✅ Registro de paciente exitoso');
      console.log(`📧 Usuario creado: ${registerResponse.data.user.email}`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ Usuario ya existe (normal en pruebas)');
      } else {
        console.log('❌ Error en registro:', error.response?.data?.message || error.message);
      }
    }

    // 2. Login como admin para crear usuarios
    console.log('\n🔐 2. LOGIN COMO ADMIN');
    console.log('-'.repeat(40));
    
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@ortowhave.com',
      password: 'admin123'
    });
    const adminToken = adminLogin.data.token;
    console.log('✅ Login admin exitoso');

    // 3. Crear usuario simplificado desde admin
    console.log('\n👨‍💼 3. CREAR USUARIO SIMPLIFICADO (ADMIN)');
    console.log('-'.repeat(40));
    
    const newUser = {
      nombre: 'María Fernanda',
      email: 'maria.fernanda@email.com', 
      password: 'password123',
      telefono: '3007654321',
      rolId: 3 // Paciente
    };

    try {
      const createResponse = await axios.post(`${BASE_URL}/users/admin/crear-usuario-simple`, newUser, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Creación de usuario simplificado exitosa');
      console.log(`📧 Usuario creado: ${createResponse.data.email}`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ Usuario ya existe (normal en pruebas)');
      } else {
        console.log('❌ Error en creación:', error.response?.data?.message || error.message);
      }
    }

    // 4. Verificar que los usuarios aparecen en la lista
    console.log('\n📋 4. VERIFICAR USUARIOS CREADOS');
    console.log('-'.repeat(40));
    
    const users = await axios.get(`${BASE_URL}/users/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✅ Total usuarios en sistema: ${users.data.length}`);
    
    const newUsers = users.data.filter(user => 
      user.email.includes('juan.carlos') || user.email.includes('maria.fernanda')
    );
    console.log(`📊 Usuarios nuevos encontrados: ${newUsers.length}`);
    
    newUsers.forEach(user => {
      console.log(`   - ${user.nombre} (${user.email}) - ${user.rol.nombre}`);
    });

    console.log('\n✅ TODAS LAS PRUEBAS DE ENDPOINTS SIMPLIFICADOS COMPLETADAS');
    
  } catch (error) {
    console.error('\n❌ ERROR EN LAS PRUEBAS:', error.message);
    if (error.response?.data) {
      console.error('Detalles:', error.response.data);
    }
  }
}

// Ejecutar las pruebas
testSimplifiedEndpoints();
