const fetch = require('node-fetch');

async function testAuth() {
  console.log('🧪 Probando sistema de autenticación...\n');

  try {
    // 1. Test de login
    console.log('1. Probando login...');
    const loginResponse = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@ortowhave.com',
        password: 'Admin123!'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login exitoso');
      console.log('👤 Usuario:', loginData.user?.nombre, loginData.user?.apellido);
      console.log('🔑 Rol:', loginData.user?.rol?.nombre);
      console.log('🎫 Token recibido:', loginData.access_token ? 'Sí' : 'No');

      // 2. Test del endpoint /me con el token
      if (loginData.access_token) {
        console.log('\n2. Probando endpoint /auth/me...');
        const meResponse = await fetch('http://localhost:4000/auth/me', {
          headers: {
            'Authorization': `Bearer ${loginData.access_token}`
          }
        });

        if (meResponse.ok) {
          const meData = await meResponse.json();
          console.log('✅ Endpoint /me funcional');
          console.log('👤 Datos del usuario verificados');
        } else {
          console.log('❌ Error en endpoint /me:', meResponse.status);
        }
      }

    } else {
      const errorData = await loginResponse.json();
      console.log('❌ Error en login:', errorData);
    }

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

testAuth();
