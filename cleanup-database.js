const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// Credenciales de admin
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

async function getAllUsers(token) {
  try {
    const response = await axios.get(`${BASE_URL}/users/admin/todos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error.response?.data || error.message);
    return [];
  }
}

async function deleteUser(userId, token) {
  try {
    const response = await axios.delete(`${BASE_URL}/users/admin/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return true;
  } catch (error) {
    console.error(`Error al eliminar usuario ${userId}:`, error.response?.data || error.message);
    return false;
  }
}

async function cleanupDatabase() {
  console.log('🧹 Iniciando limpieza de la base de datos...');
  
  try {
    // 1. Login como admin
    console.log('📝 Haciendo login como administrador...');
    const token = await loginAsAdmin();
    console.log('✅ Login exitoso');

    // 2. Obtener todos los usuarios
    console.log('👥 Obteniendo lista de usuarios...');
    const users = await getAllUsers(token);
    console.log(`📊 Total de usuarios encontrados: ${users.length}`);

    // 3. Usuarios principales que NO se deben eliminar
    const keepEmails = [
      'admin@ortowhave.com',
      'doctor@ortowhave.com', 
      'paciente@ortowhave.com'
    ];

    // 4. Filtrar usuarios a eliminar
    const usersToDelete = users.filter(user => !keepEmails.includes(user.email));
    
    console.log('🔍 Usuarios que se mantendrán:');
    users.filter(user => keepEmails.includes(user.email)).forEach(user => {
      console.log(`   ✅ ${user.email} (${user.rol?.nombre}) - ID: ${user.id}`);
    });

    console.log(`\n🗑️  Usuarios que se eliminarán: ${usersToDelete.length}`);
    
    if (usersToDelete.length === 0) {
      console.log('ℹ️  No hay usuarios adicionales para eliminar. Solo están los usuarios principales.');
      return;
    }

    // 5. Eliminar usuarios no esenciales
    let deletedCount = 0;
    for (const user of usersToDelete) {
      console.log(`   Eliminando: ${user.email} (${user.rol?.nombre}) - ID: ${user.id}`);
      const deleted = await deleteUser(user.id, token);
      if (deleted) {
        console.log(`   ✅ Usuario eliminado: ${user.email}`);
        deletedCount++;
      } else {
        console.log(`   ❌ Error al eliminar: ${user.email}`);
      }
    }

    // 6. Verificar resultado final
    console.log('\n🔍 Verificando limpieza...');
    const finalUsers = await getAllUsers(token);
    console.log(`📊 Usuarios restantes: ${finalUsers.length}`);
    
    console.log('\n📋 Usuarios finales en el sistema:');
    finalUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.rol?.nombre}) - ID: ${user.id}`);
    });

    console.log(`\n🎉 ¡Limpieza completada! Se eliminaron ${deletedCount} usuarios.`);
    console.log('💡 Ahora puedes crear tus propios doctores y pacientes desde la interfaz web.');

  } catch (error) {
    console.error('❌ Error en la limpieza:', error.message);
  }
}

// Ejecutar script
cleanupDatabase();
