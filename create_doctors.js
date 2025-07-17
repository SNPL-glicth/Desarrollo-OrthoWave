import api from './frontend/my-app/src/services/api';

async function createDoctors() {
  const sampleDoctors = [
    {
      usuarioId: 1, // ID de usuario existente para doctor
      nombre: 'Carlos',
      apellido: 'Gómez',
      especialidad: 'Cardiología',
      direccionConsultorio: 'Calle 123',
      aceptaNuevosPacientes: true
    },
    {
      usuarioId: 2,
      nombre: 'Ana',
      apellido: 'Pérez',
      especialidad: 'Dermatología',
      direccionConsultorio: 'Avenida 456',
      aceptaNuevosPacientes: true
    }
  ];

  for (const doctor of sampleDoctors) {
    try {
      const response = await api.post('/perfil-medico', doctor);
      console.log('Doctor created:', response.data);
    } catch (error) {
      console.error('Error creating doctor:', error);
    }
  }
}

createDoctors();
