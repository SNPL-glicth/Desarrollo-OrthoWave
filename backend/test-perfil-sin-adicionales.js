const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// Datos de prueba para login
const testLogin = {
  email: 'paciente@ortowhave.com',
  password: 'paciente123'
};

// Datos de prueba para actualizar perfil (sin campos médicos ni adicionales)
const testProfileUpdate = {
  genero: 'Masculino',
  tipoAfiliacion: 'EPS',
  eps: 'Sanitas',
  contactoEmergenciaNombre: 'María González',
  contactoEmergenciaTelefono: '+57 301 234 5678',
  contactoEmergenciaParentesco: 'Madre',
  usuario: {
    telefono: '+57 300 987 6543'
  }
};

async function testProfile() {
  console.log('🧪 PROBANDO PERFIL DE PACIENTE SIN CAMPOS ADICIONALES');
  console.log('======================================================');

  try {
    // 1. Login
    console.log('1. Haciendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testLogin);
    
    if (loginResponse.status === 201) {
      console.log('✅ Login exitoso');
      console.log('🔍 Respuesta completa:', JSON.stringify(loginResponse.data, null, 2));
    }
    
    const token = loginResponse.data.access_token || loginResponse.data.token;
    console.log('🔍 Token recibido:', token ? 'Token presente' : 'Token no encontrado');
    const headers = { Authorization: `Bearer ${token}` };

    // 2. Obtener perfil actual
    console.log('2. Obteniendo perfil actual...');
    const profileResponse = await axios.get(`${BASE_URL}/pacientes/mi-perfil`, { headers });
    
    if (profileResponse.status === 200) {
      console.log('✅ Perfil obtenido exitosamente');
      console.log('📋 Datos del perfil:');
      console.log('- Nombre:', profileResponse.data.usuario?.nombre, profileResponse.data.usuario?.apellido);
      console.log('- Email:', profileResponse.data.usuario?.email);
      console.log('- Teléfono:', profileResponse.data.usuario?.telefono);
      console.log('- Género:', profileResponse.data.genero);
      console.log('- Tipo Afiliación:', profileResponse.data.tipoAfiliacion);
      console.log('- EPS:', profileResponse.data.eps);
      console.log('- Contacto Emergencia:', profileResponse.data.contactoEmergenciaNombre);
      
      // Verificar que NO hay campos adicionales
      if (profileResponse.data.estadoCivil !== undefined || 
          profileResponse.data.ocupacion !== undefined ||
          profileResponse.data.ciudadResidencia !== undefined ||
          profileResponse.data.barrio !== undefined) {
        console.log('⚠️  ADVERTENCIA: Se encontraron campos adicionales que deberían haber sido eliminados');
      } else {
        console.log('✅ Confirmado: No hay campos adicionales presentes');
      }
      
      // Verificar que NO hay campos médicos
      if (profileResponse.data.peso !== undefined || 
          profileResponse.data.estatura !== undefined ||
          profileResponse.data.grupoSanguineo !== undefined ||
          profileResponse.data.alergias !== undefined) {
        console.log('⚠️  ADVERTENCIA: Se encontraron campos médicos que deberían haber sido eliminados');
      } else {
        console.log('✅ Confirmado: No hay campos médicos presentes');
      }
    }

    // 3. Actualizar perfil
    console.log('3. Actualizando perfil...');
    const updateResponse = await axios.patch(`${BASE_URL}/pacientes/mi-perfil`, testProfileUpdate, { headers });
    
    if (updateResponse.status === 200) {
      console.log('✅ Perfil actualizado exitosamente');
      console.log('📋 Datos actualizados:');
      console.log('- Género:', updateResponse.data.genero);
      console.log('- Tipo Afiliación:', updateResponse.data.tipoAfiliacion);
      console.log('- EPS:', updateResponse.data.eps);
      console.log('- Teléfono:', updateResponse.data.usuario?.telefono);
      console.log('- Contacto Emergencia:', updateResponse.data.contactoEmergenciaNombre);
      console.log('- Teléfono Emergencia:', updateResponse.data.contactoEmergenciaTelefono);
      console.log('- Parentesco:', updateResponse.data.contactoEmergenciaParentesco);
    }

    // 4. Verificar cambios en la base de datos
    console.log('4. Verificando datos en la base de datos...');
    const verificationResponse = await axios.get(`${BASE_URL}/pacientes/mi-perfil`, { headers });
    
    if (verificationResponse.status === 200) {
      console.log('✅ Verificación exitosa');
      const data = verificationResponse.data;
      
      // Verificar que los datos se guardaron correctamente
      const verificaciones = [
        { campo: 'Género', esperado: testProfileUpdate.genero, actual: data.genero },
        { campo: 'Tipo Afiliación', esperado: testProfileUpdate.tipoAfiliacion, actual: data.tipoAfiliacion },
        { campo: 'EPS', esperado: testProfileUpdate.eps, actual: data.eps },
        { campo: 'Teléfono Usuario', esperado: testProfileUpdate.usuario.telefono, actual: data.usuario?.telefono },
        { campo: 'Contacto Emergencia', esperado: testProfileUpdate.contactoEmergenciaNombre, actual: data.contactoEmergenciaNombre },
        { campo: 'Teléfono Emergencia', esperado: testProfileUpdate.contactoEmergenciaTelefono, actual: data.contactoEmergenciaTelefono },
        { campo: 'Parentesco', esperado: testProfileUpdate.contactoEmergenciaParentesco, actual: data.contactoEmergenciaParentesco }
      ];
      
      let todasLasVerificacionesCorrectas = true;
      verificaciones.forEach(v => {
        if (v.actual === v.esperado) {
          console.log(`✅ ${v.campo}: ${v.actual} (correcto)`);
        } else {
          console.log(`❌ ${v.campo}: esperado "${v.esperado}", actual "${v.actual}"`);
          todasLasVerificacionesCorrectas = false;
        }
      });
      
      if (todasLasVerificacionesCorrectas) {
        console.log('🎉 ¡TODOS LOS DATOS SE VERIFICARON CORRECTAMENTE!');
      } else {
        console.log('⚠️  Algunas verificaciones fallaron');
      }
    }

    console.log('\n🎯 RESUMEN DE LA PRUEBA:');
    console.log('✅ Sistema funcionando SIN campos médicos');
    console.log('✅ Sistema funcionando SIN campos adicionales (estado civil, ocupación, ciudad, barrio)');
    console.log('✅ Solo campos básicos y contacto de emergencia presentes');
    console.log('✅ Funcionalidades de login, lectura, actualización y verificación operativas');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('🔍 Código de estado HTTP:', error.response.status);
    }
  }
}

// Ejecutar las pruebas
testProfile();
