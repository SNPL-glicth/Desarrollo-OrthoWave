import axios from 'axios';
import { API_CONFIG } from '../config/api.js';

// Crear una instancia de axios con la configuración base
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
  // Configuraciones adicionales para mejorar confiabilidad
  maxRedirects: 0, // No seguir redirects automáticamente
  validateStatus: function (status) {
    // Considerar exitoso cualquier status 2xx
    return status >= 200 && status < 300;
  }
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔍 API Request Debug:', {
      url: config.url,
      method: config.method?.toUpperCase(),
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 10)}...` : 'No token',
      headers: config.headers
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ No token found in localStorage for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', {
      url: response.config.url,
      status: response.status,
      method: response.config.method?.toUpperCase()
    });
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      hasToken: !!error.config?.headers?.Authorization
    });
    
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      if (error.response.status === 401) {
        // Solo limpiar tokens pero NO redirigir automáticamente
        // Dejar que cada componente maneje su propia lógica de redirección
        const publicPaths = ['/', '/login', '/register', '/verification', '/verify-email'];
        const isPublicPath = publicPaths.includes(window.location.pathname);
        
        if (!isPublicPath) {
          // Solo redirigir si estamos en una ruta protegida
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else {
          // En rutas públicas, solo limpiar tokens sin redirigir
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      // Mantener la estructura original del error para que auth.service.js pueda manejarlo
      return Promise.reject(error);
    } else if (error.request) {
      // La solicitud se realizó pero no se recibió respuesta
      return Promise.reject({
        ...error,
        message: 'No se pudo conectar con el servidor'
      });
    } else {
      // Algo sucedió en la configuración de la solicitud
      return Promise.reject({
        ...error,
        message: 'Error al procesar la solicitud'
      });
    }
  }
);

export const userService = {
  getUsers: () => api.get('/usuarios'),
  getUser: (id) => api.get(`/usuarios/${id}`),
  updateUser: (id, userData) => api.put(`/usuarios/${id}`, userData),
  deleteUser: (id) => api.delete(`/usuarios/${id}`),
  activateUser: (id) => api.put(`/usuarios/${id}/activar`),
  deactivateUser: (id) => api.put(`/usuarios/${id}/desactivar`),
};

export default api;
