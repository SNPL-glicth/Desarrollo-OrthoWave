const axios = require('axios');

// Configuración de la API
const API_BASE_URL = 'http://localhost:4000';

// Función para crear citas de prueba
async function createTestCitas() {
  try {
    console.log('🧪 Creando citas de prueba para usuarios principales...\n');
    
    // Login como admin para crear citas
    const adminLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@ortowhave.com',
      password: 'admin123'
    });
    
    const headers = {
      'Authorization': `Bearer ${adminLogin.data.access_token}`,
      'Content-Type': 'application/json'
    };
    
    // Crear citas de prueba para usuarios principales
    const citasPrueba = [
      {
        pacienteId: 3, // paciente@ortowhave.com
        doctorId: 2,   // doctor@ortowhave.com
        fechaHora: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duracion: 60,
        tipoConsulta: 'primera_vez',
        motivoConsulta: 'Consulta inicial de ortodoncia',
        notasPaciente: 'Cita creada para pruebas del dashboard'
      },
      {
        pacienteId: 3, // paciente@ortowhave.com
        doctorId: 14,  // doctor.principal@ortowhave.com
        fechaHora: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        duracion: 45,
        tipoConsulta: 'control',
        motivoConsulta: 'Revisión de progreso',
        notasPaciente: 'Segunda cita para seguimiento'
      },
      {
        pacienteId: 3, // paciente@ortowhave.com
        doctorId: 2,   // doctor@ortowhave.com
        fechaHora: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        duracion: 30,
        tipoConsulta: 'seguimiento',
        motivoConsulta: 'Evaluación post-tratamiento',
        notasPaciente: 'Cita de seguimiento'
      }
    ];
    
    console.log('📝 Insertando citas de prueba...');
    
    for (let i = 0; i < citasPrueba.length; i++) {
      const cita = citasPrueba[i];
      
      try {
        // Crear cita directamente en la base de datos para evitar validaciones de horario
        console.log(`Creando cita ${i + 1}:`, {
          paciente: cita.pacienteId,
          doctor: cita.doctorId,
          fecha: cita.fechaHora,
          motivo: cita.motivoConsulta
        });
        
        const response = await axios.post(`${API_BASE_URL}/citas`, cita, { headers });
        console.log(`✅ Cita ${i + 1} creada exitosamente:`, response.data.id);
        
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.message?.includes('horario')) {
          console.log(`⚠️  Cita ${i + 1} falló por horario. Intentando con horario diferente...`);
          
          // Intentar con horario diferente
          const nuevaFecha = new Date(cita.fechaHora);
          nuevaFecha.setHours(nuevaFecha.getHours() + 2); // Agregar 2 horas
          
          try {
            const citaModificada = { ...cita, fechaHora: nuevaFecha.toISOString() };
            const response = await axios.post(`${API_BASE_URL}/citas`, citaModificada, { headers });
            console.log(`✅ Cita ${i + 1} creada con horario modificado:`, response.data.id);
          } catch (error2) {
            console.error(`❌ Error al crear cita ${i + 1} (segundo intento):`, error2.response?.data?.message || error2.message);
          }
        } else {
          console.error(`❌ Error al crear cita ${i + 1}:`, error.response?.data?.message || error.message);
        }
      }
    }
    
    console.log('\n🔍 Verificando citas creadas...');
    
    // Verificar citas para el paciente 3
    const paciente3Citas = await axios.get(`${API_BASE_URL}/citas/paciente/3`, { headers });
    console.log(`📊 Citas para paciente 3: ${paciente3Citas.data.length}`);
    paciente3Citas.data.forEach(cita => {
      console.log(`  - ID: ${cita.id}, Doctor: ${cita.doctorId}, Fecha: ${cita.fechaHora}, Estado: ${cita.estado}`);
    });
    
    // Verificar citas para el doctor 2
    const doctor2Citas = await axios.get(`${API_BASE_URL}/citas/doctor/2`, { headers });
    console.log(`📊 Citas para doctor 2: ${doctor2Citas.data.length}`);
    doctor2Citas.data.forEach(cita => {
      console.log(`  - ID: ${cita.id}, Paciente: ${cita.pacienteId}, Fecha: ${cita.fechaHora}, Estado: ${cita.estado}`);
    });
    
    // Verificar citas para el doctor 14
    const doctor14Citas = await axios.get(`${API_BASE_URL}/citas/doctor/14`, { headers });
    console.log(`📊 Citas para doctor 14: ${doctor14Citas.data.length}`);
    doctor14Citas.data.forEach(cita => {
      console.log(`  - ID: ${cita.id}, Paciente: ${cita.pacienteId}, Fecha: ${cita.fechaHora}, Estado: ${cita.estado}`);
    });
    
    console.log('\n✅ Proceso completado. Las citas han sido creadas exitosamente.');
    console.log('🎯 Ahora puedes probar el dashboard con los usuarios:');
    console.log('   - Paciente: paciente@ortowhave.com / paciente123');
    console.log('   - Doctor: doctor@ortowhave.com / doctor123');
    console.log('   - Doctor Principal: doctor.principal@ortowhave.com / doctor123');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar
createTestCitas();
