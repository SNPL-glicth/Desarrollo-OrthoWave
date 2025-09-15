import api from './api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'administrador' | 'doctor' | 'paciente';
  specialization?: string;
  rating?: number;
  experience?: string;
  profileImage?: string;
  consultationFee?: number;
  biography?: string;
  createdAt: string;
  updatedAt?: string;
}

export const userService = {
  // Obtener todos los usuarios
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },

  // Obtener usuario por ID
  async getUserById(id: string): Promise<User> {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  },

  // Obtener doctores
  async getDoctors(): Promise<User[]> {
    try {
      const response = await api.get('/users/doctors');
      return response.data;
    } catch (error) {
      console.error('Error al obtener doctores:', error);
      throw error;
    }
  },

  // Obtener pacientes
  async getPatients(): Promise<User[]> {
    try {
      const response = await api.get('/users/patients');
      return response.data;
    } catch (error) {
      console.error('Error al obtener pacientes:', error);
      throw error;
    }
  },

  // Actualizar usuario
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  },

  // Eliminar usuario
  async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  },

  // Buscar usuarios
  async searchUsers(query: string): Promise<User[]> {
    try {
      const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      throw error;
    }
  },

  // Cambiar contraseña
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.put(`/users/${userId}/password`, {
        currentPassword,
        newPassword
      });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  },

  // Actualizar foto de perfil
  async updateProfileImage(userId: string, imageFile: File): Promise<User> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await api.put(`/users/${userId}/profile-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar foto de perfil:', error);
      throw error;
    }
  }
};
