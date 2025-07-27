#!/usr/bin/env node

// Script para limpiar usuarios extra de la base de datos
const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// Credenciales de administrador
const ADMIN_CREDENTIALS = {
  email: 'admin@ortowhave.com',
  password: 'admin123'
};

// IDs de usuarios a mantener (admin, doctor, paciente principales)
const KEEP_USER_IDS = [1, 2, 3];

async function cleanupUsers() {
  console.log('🧹 Iniciando limpieza de usuarios...\n');
  
  try {
    // 1. Login como admin
    console.log('1. Iniciando sesión como administrador...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    const token = loginResponse.data.access_token;
    console.log('✅ Login exitoso\n');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // 2. Obtener todos los usuarios
    console.log('2. Obteniendo lista de usuarios...');
    const usersResponse = await axios.get(`${BASE_URL}/users/admin/todos`, { headers });
    const users = usersResponse.data;
    console.log(`✅ Encontrados ${users.length} usuarios\n`);
    
    // 3. Identificar usuarios a eliminar
    const usersToDelete = users.filter(user => !KEEP_USER_IDS.includes(user.id));
    console.log(`📋 Usuarios a eliminar: ${usersToDelete.length}`);
    
    if (usersToDelete.length === 0) {
      console.log('✅ No hay usuarios para eliminar. Base de datos limpia.\n');
      return;
    }
    
    // 4. Eliminar usuarios uno por uno
    console.log('\n🗑️ Eliminando usuarios...');
    for (const user of usersToDelete) {
      try {
        console.log(`   Eliminando: ${user.nombre} ${user.apellido} (${user.email})`);
        await axios.delete(`${BASE_URL}/users/admin/${user.id}`, { headers });
        console.log(`   ✅ Usuario eliminado: ID ${user.id}`);
      } catch (error) {
        console.log(`   ❌ Error eliminando usuario ID ${user.id}: ${error.response?.data?.message || error.message}`);
      }
    }
    
    // 5. Verificar resultado
    console.log('\n📊 Verificando resultado...');
    const finalUsersResponse = await axios.get(`${BASE_URL}/users/admin/todos`, { headers });
    const finalUsers = finalUsersResponse.data;
    
    console.log(`✅ Usuarios restantes: ${finalUsers.length}`);
    console.log('\n👥 Usuarios finales:');
    finalUsers.forEach(user => {
      console.log(`   - ${user.nombre} ${user.apellido} (${user.email}) - ${user.rol.nombre}`);
    });
    
    console.log('\n🎉 Limpieza completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error general:', error.response?.data || error.message);
  }
}

// Ejecutar la limpieza
cleanupUsers();
