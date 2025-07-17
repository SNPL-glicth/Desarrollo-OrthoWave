const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// Credenciales del primer doctor que creamos
const DOCTOR_CREDENTIALS = {
  email: 'carlos.gomez@ortowhave.com',
  password: 'doctor123'
};

async function loginAsDoctor() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, DOCTOR_CREDENTIALS);
    return response.data.access_token;
  } catch (error) {
    console.error('Error al hacer login como doctor:', error.response?.data || error.message);
    throw error;
  }
}

async function createAppointment(appointmentData, token) {
  try {
    const response = await axios.post(`${BASE_URL}/citas`, appointmentData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear cita:', error.response?.data || error.message);
    return null;
  }
}

async function setupSimpleAppointments() {
  console.log('🚀 Iniciando configuración simplificada de citas...');
  
  try {
    // 1. Login como doctor
    console.log('📝 Haciendo login como doctor...');
    const token = await loginAsDoctor();
    console.log('✅ Login exitoso');

    // 2. Crear citas con horarios más realistas
    const sampleAppointments = [
      {
        pacienteId: 9,  // María José Rodríguez
        doctorId: 4,    // Dr. Carlos Gómez (Cardiología)
        fechaHora: '2024-07-15T10:00:00.000Z',
        duracion: 60,
        estado: 'confirmada',
        tipoConsulta: 'control',
        motivoConsulta: 'Control cardiológico de rutina'
      },
      {
        pacienteId: 10, // Juan Carlos López
        doctorId: 4,    // Dr. Carlos Gómez (Cardiología)
        fechaHora: '2024-07-16T11:00:00.000Z',
        duracion: 60,
        estado: 'pendiente',
        tipoConsulta: 'primera_vez',
        motivoConsulta: 'Dolor en el pecho ocasional'
      },
      {
        pacienteId: 11, // Ana Sofía Gómez
        doctorId: 4,    // Dr. Carlos Gómez (Cardiología)  
        fechaHora: '2024-07-17T14:00:00.000Z',
        duracion: 60,
        estado: 'pendiente',
        tipoConsulta: 'primera_vez',
        motivoConsulta: 'Evaluación cardiovascular preventiva'
      }
    ];

    console.log('📅 Creando citas como doctor...');
    
    for (const appointment of sampleAppointments) {
      console.log(`   Creando cita: Paciente ${appointment.pacienteId} - ${appointment.motivoConsulta}`);
      const cita = await createAppointment(appointment, token);
      if (cita) {
        console.log(`   ✅ Cita creada exitosamente - Estado: ${appointment.estado}`);
      }
    }

    console.log('🎉 ¡Configuración de citas completada!');

  } catch (error) {
    console.error('❌ Error en la configuración:', error.message);
  }
}

// Ejecutar script
setupSimpleAppointments();
