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

async function checkExistingAppointments(token) {
  try {
    const response = await axios.get(`${BASE_URL}/citas/mis-citas`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al verificar citas existentes:', error.response?.data || error.message);
    return [];
  }
}

async function setupSampleAppointments() {
  console.log('🚀 Iniciando configuración de citas de muestra...');
  
  try {
    // 1. Login como admin
    console.log('📝 Haciendo login como administrador...');
    const token = await loginAsAdmin();
    console.log('✅ Login exitoso');

    // 2. Verificar citas existentes
    console.log('🔍 Verificando citas existentes...');
    const existingAppointments = await checkExistingAppointments(token);
    console.log(`📊 Citas existentes: ${existingAppointments.length}`);

    if (existingAppointments.length > 5) {
      console.log('ℹ️  Ya existen suficientes citas en el sistema');
      return;
    }

    // 3. Crear citas de ejemplo conectando doctores y pacientes
    // Asumiendo IDs basados en los scripts anteriores:
    // Doctores: IDs 4, 5, 6, 7, 8
    // Pacientes: IDs 9, 10, 11, 12, 13
    const sampleAppointments = [
      {
        pacienteId: 9, // María José Rodríguez
        doctorId: 4,   // Dr. Carlos Gómez (Cardiología)
        fechaHora: '2024-07-15T09:00:00.000Z',
        duracion: 60,
        estado: 'confirmada',
        tipoConsulta: 'control',
        motivoConsulta: 'Control cardiológico de rutina',
        notasPaciente: 'Paciente refiere palpitaciones ocasionales'
      },
      {
        pacienteId: 10, // Juan Carlos López
        doctorId: 5,    // Dra. Ana Pérez (Dermatología)
        fechaHora: '2024-07-15T10:30:00.000Z',
        duracion: 45,
        estado: 'confirmada',
        tipoConsulta: 'primera_vez',
        motivoConsulta: 'Evaluación de lunar sospechoso',
        notasPaciente: 'Paciente nota cambios en lunar del brazo izquierdo'
      },
      {
        pacienteId: 11, // Ana Sofía Gómez
        doctorId: 6,    // Dr. Roberto Martínez (Ortodoncia)
        fechaHora: '2024-07-15T14:00:00.000Z',
        duracion: 45,
        estado: 'confirmada',
        tipoConsulta: 'primera_vez',
        motivoConsulta: 'Consulta inicial de ortodoncia',
        notasPaciente: 'Interesada en ortodoncia invisible'
      },
      {
        pacienteId: 12, // Carlos Andrés Hernández
        doctorId: 7,    // Dra. Laura González (Pediatría)
        fechaHora: '2024-07-15T08:00:00.000Z',
        duracion: 30,
        estado: 'confirmada',
        tipoConsulta: 'control',
        motivoConsulta: 'Control de salud general',
        notasPaciente: 'Paciente joven, control preventivo'
      },
      {
        pacienteId: 13, // Laura Patricia Moreno
        doctorId: 8,    // Dr. Miguel Herrera (Neurología)
        fechaHora: '2024-07-15T15:00:00.000Z',
        duracion: 60,
        estado: 'confirmada',
        tipoConsulta: 'control',
        motivoConsulta: 'Seguimiento de migrañas',
        notasPaciente: 'Paciente con migrañas recurrentes'
      },
      {
        pacienteId: 9, // María José Rodríguez
        doctorId: 6,   // Dr. Roberto Martínez (Ortodoncia)
        fechaHora: '2024-07-16T11:00:00.000Z',
        duracion: 45,
        estado: 'pendiente',
        tipoConsulta: 'primera_vez',
        motivoConsulta: 'Evaluación ortodóntica',
        notasPaciente: 'Referida por odontólogo general'
      },
      {
        pacienteId: 10, // Juan Carlos López
        doctorId: 4,    // Dr. Carlos Gómez (Cardiología)
        fechaHora: '2024-07-16T16:00:00.000Z',
        duracion: 60,
        estado: 'pendiente',
        tipoConsulta: 'primera_vez',
        motivoConsulta: 'Dolor en el pecho ocasional',
        notasPaciente: 'Paciente refiere dolor precordial al hacer ejercicio'
      },
      {
        pacienteId: 11, // Ana Sofía Gómez
        doctorId: 8,    // Dr. Miguel Herrera (Neurología)
        fechaHora: '2024-07-17T09:30:00.000Z',
        duracion: 60,
        estado: 'pendiente',
        tipoConsulta: 'primera_vez',
        motivoConsulta: 'Cefaleas frecuentes',
        notasPaciente: 'Dolores de cabeza que empeoran con el estrés'
      }
    ];

    console.log('📅 Creando citas de muestra...');
    
    for (const appointment of sampleAppointments) {
      console.log(`   Creando cita: Paciente ${appointment.pacienteId} con Doctor ${appointment.doctorId}`);
      const cita = await createAppointment(appointment, token);
      if (cita) {
        console.log(`   ✅ Cita creada exitosamente - Estado: ${appointment.estado}`);
      }
    }

    // 4. Verificar resultado final
    console.log('🔍 Verificando citas creadas...');
    const finalAppointments = await checkExistingAppointments(token);
    console.log(`🎉 ¡Configuración completada! Total de citas: ${finalAppointments.length}`);

  } catch (error) {
    console.error('❌ Error en la configuración:', error.message);
  }
}

// Ejecutar script
setupSampleAppointments();
