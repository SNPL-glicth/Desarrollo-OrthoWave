import api from './api';

export const sampleDataService = {
  // Crear datos de ejemplo para perfiles médicos
  async createSampleDoctors() {
    try {
      const sampleDoctors = [
        {
          usuarioId: 1, // Este debería ser un ID de usuario válido con rol doctor
          especialidad: 'Cardiología',
          numeroLicencia: 'MED-001',
          subespecialidades: ['Cardiología Interventiva', 'Electrofisiología'],
          añosExperiencia: 10,
          educacion: 'Universidad Nacional - Especialización en Cardiología',
          certificaciones: ['Cardiología Interventiva', 'Electrofisiología Cardíaca'],
          idiomasHablados: ['Español', 'Inglés'],
          tarifaConsulta: 150000,
          duracionConsultaDefault: 60,
          aceptaNuevosPacientes: true,
          horarioAtencion: 'Lunes a Viernes 8:00 AM - 6:00 PM',
          diasAtencion: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
          horaInicio: '08:00',
          horaFin: '18:00',
          horaAlmuerzoInicio: '12:00',
          horaAlmuerzoFin: '13:00',
          direccionConsultorio: 'Carrera 15 #85-32, Consultorio 501',
          ciudad: 'Bogotá',
          telefono: '3201234567',
          email: 'cardiologo@hospital.com',
          sitioWeb: 'https://cardiologo.com',
          redSocial: '@cardiologo_bogota',
          verificadoColegio: true,
          activo: true
        },
        {
          usuarioId: 2,
          especialidad: 'Dermatología',
          numeroLicencia: 'MED-002',
          subespecialidades: ['Dermatología Cosmética', 'Dermatología Oncológica'],
          añosExperiencia: 8,
          educacion: 'Universidad Javeriana - Especialización en Dermatología',
          certificaciones: ['Dermatología Cosmética', 'Cirugía Dermatológica'],
          idiomasHablados: ['Español', 'Francés'],
          tarifaConsulta: 120000,
          duracionConsultaDefault: 45,
          aceptaNuevosPacientes: true,
          horarioAtencion: 'Lunes a Sábado 9:00 AM - 5:00 PM',
          diasAtencion: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
          horaInicio: '09:00',
          horaFin: '17:00',
          horaAlmuerzoInicio: '12:30',
          horaAlmuerzoFin: '13:30',
          direccionConsultorio: 'Calle 100 #15-25, Torre Médica, Piso 8',
          ciudad: 'Bogotá',
          telefono: '3109876543',
          email: 'dermatologo@clinica.com',
          sitioWeb: 'https://dermatologo.com',
          redSocial: '@dermatologo_experto',
          verificadoColegio: true,
          activo: true
        }
      ];

      const results = [];
      for (const doctor of sampleDoctors) {
        try {
          const response = await api.post('/perfil-medico', doctor);
          results.push(response.data);
        } catch (error: any) {
          console.error('Error creating doctor:', error);
          results.push({ error: error.response?.data?.message || 'Error creating doctor' });
        }
      }

      return results;
    } catch (error) {
      console.error('Error creating sample doctors:', error);
      throw error;
    }
  },

  // Crear datos de ejemplo para usuarios (doctores y pacientes)
  async createSampleUsers() {
    try {
      const sampleUsers = [
        {
          nombre: 'Juan Carlos',
          apellido: 'Rodríguez',
          email: 'doctor1@hospital.com',
          password: '123456',
          rolId: 2, // Asumiendo que 2 es el ID del rol doctor
          telefono: '3201234567',
          activo: true,
          verificado: true
        },
        {
          nombre: 'María Elena',
          apellido: 'García',
          email: 'doctor2@clinica.com',
          password: '123456',
          rolId: 2,
          telefono: '3109876543',
          activo: true,
          verificado: true
        },
        {
          nombre: 'Pedro',
          apellido: 'Martínez',
          email: 'paciente1@email.com',
          password: '123456',
          rolId: 3, // Asumiendo que 3 es el ID del rol paciente
          telefono: '3155551234',
          activo: true,
          verificado: true
        },
        {
          nombre: 'Ana',
          apellido: 'López',
          email: 'paciente2@email.com',
          password: '123456',
          rolId: 3,
          telefono: '3166554321',
          activo: true,
          verificado: true
        }
      ];

      const results = [];
      for (const user of sampleUsers) {
        try {
          const response = await api.post('/users', user);
          results.push(response.data);
        } catch (error: any) {
          console.error('Error creating user:', error);
          results.push({ error: error.response?.data?.message || 'Error creating user' });
        }
      }

      return results;
    } catch (error) {
      console.error('Error creating sample users:', error);
      throw error;
    }
  },

  // Obtener información del sistema para debugging
  async getSystemInfo() {
    try {
      const responses = await Promise.allSettled([
        api.get('/users'),
        api.get('/perfil-medico/doctores'),
        api.get('/perfil-medico/doctores-disponibles'),
        api.get('/pacientes')
      ]);

      return {
        users: responses[0].status === 'fulfilled' ? responses[0].value.data : null,
        allDoctors: responses[1].status === 'fulfilled' ? responses[1].value.data : null,
        availableDoctors: responses[2].status === 'fulfilled' ? responses[2].value.data : null,
        patients: responses[3].status === 'fulfilled' ? responses[3].value.data : null,
        errors: responses.map((r, i) => 
          r.status === 'rejected' ? { index: i, error: r.reason } : null
        ).filter(Boolean)
      };
    } catch (error) {
      console.error('Error getting system info:', error);
      throw error;
    }
  }
};
