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

async function checkUsersOnly() {
  console.log('🔍 SOLO VIENDO qué usuarios hay (NO elimino nada, prometo!)...');
  
  try {
    // Login como admin
    console.log('📝 Haciendo login como administrador...');
    const token = await loginAsAdmin();
    console.log('✅ Login exitoso');

    // Ver todos los usuarios
    console.log('👥 Obteniendo lista de usuarios...');
    const response = await axios.get(`${BASE_URL}/users/admin/todos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const users = response.data;
    console.log(`📊 Total de usuarios en la base de datos: ${users.length}`);
    
    console.log('\n📋 Lista completa de usuarios:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.rol?.nombre}) - ID: ${user.id} - ${user.nombre} ${user.apellido}`);
    });

    // Contar por roles
    const adminCount = users.filter(u => u.rol?.nombre === 'admin').length;
    const doctorCount = users.filter(u => u.rol?.nombre === 'doctor').length;
    const pacienteCount = users.filter(u => u.rol?.nombre === 'paciente').length;

    console.log('\n📈 Resumen por roles:');
    console.log(`   🔧 Admins: ${adminCount}`);
    console.log(`   🩺 Doctores: ${doctorCount}`);
    console.log(`   👨‍⚕️ Pacientes: ${pacienteCount}`);

    console.log('\n💡 Esto es lo que el panel de admin debería mostrar.');
    console.log('🚫 NO eliminé nada, solo revisé qué hay.');

  } catch (error) {
    console.error('❌ Error al verificar usuarios:', error.message);
  }
}

// Ejecutar solo verificación
checkUsersOnly();
