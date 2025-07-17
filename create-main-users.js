const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function createMainUsers() {
  console.log('👤 Creando usuarios principales...');
  
  const mainUsers = [
    {
      nombre: 'Administrador',
      apellido: 'Principal',
      email: 'admin@ortowhave.com',
      password: 'admin123',
      telefono: '+57 300 000 0001',
      direccion: 'Dirección Admin',
      rolId: 1
    },
    {
      nombre: 'Doctor',
      apellido: 'Principal',
      email: 'doctor@ortowhave.com',
      password: 'doctor123',
      telefono: '+57 300 000 0002',
      direccion: 'Dirección Doctor',
      rolId: 2
    },
    {
      nombre: 'Paciente',
      apellido: 'Demo',
      email: 'paciente@ortowhave.com',
      password: 'paciente123',
      telefono: '+57 300 000 0003',
      direccion: 'Dirección Paciente',
      rolId: 3
    }
  ];

  try {
    for (const userData of mainUsers) {
      try {
        console.log(`   Creando: ${userData.email}...`);
        const response = await axios.post(`${BASE_URL}/users/public/crear-usuario`, userData);
        console.log(`   ✅ ${userData.email} creado exitosamente`);
      } catch (error) {
        if (error.response?.data?.message?.includes('ya existe')) {
          console.log(`   ℹ️  ${userData.email} ya existe`);
        } else {
          console.error(`   ❌ Error creando ${userData.email}:`, error.response?.data?.message || error.message);
        }
      }
    }

    console.log('\n🎉 ¡Configuración completada!');
    console.log('\n👤 Usuarios disponibles para login:');
    console.log('   🔧 Admin: admin@ortowhave.com / admin123');
    console.log('   🩺 Doctor: doctor@ortowhave.com / doctor123');
    console.log('   👨‍⚕️ Paciente: paciente@ortowhave.com / paciente123');
    
    console.log('\n💡 Ahora puedes:');
    console.log('   1. Loguearte como admin y crear nuevos doctores y pacientes');
    console.log('   2. Los dashboards mostrarán los datos apropiados según el rol');
    console.log('   3. ¡La base de datos está limpia y lista para tus usuarios!');

  } catch (error) {
    console.error('❌ Error en la configuración:', error.message);
  }
}

// Ejecutar
createMainUsers();
