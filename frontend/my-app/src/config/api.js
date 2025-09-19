// Configuración centralizada para todas las URLs de la API

// Función para obtener la URL base del backend dinámicamente
const getBaseURL = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // Detectar si estamos en producción (Railway o similar)
  const isProduction = hostname.includes('railway.app') || 
                      hostname.includes('up.railway.app') || 
                      hostname.includes('ortowhavecolombia.com') ||
                      (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168') && !hostname.startsWith('10.'));
  
  // Si estamos en producción, usar HTTPS y el mismo dominio
  if (isProduction) {
    return `https://${hostname}`;
  }
  
  // Si estamos accediendo desde localhost, usar localhost para el backend
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:4000';
  }
  
  // Para IPs locales (desarrollo en red local), usar puerto 4000
  return `http://${hostname}:4000`;
};

// Configuración de la API
export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  TIMEOUT: 10000,
  WITH_CREDENTIALS: true,
};

// URLs específicas para diferentes servicios
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout'
  },
  USERS: {
    BASE: '/users',
    ADMIN: '/users/admin',
    PUBLIC_ROLES: '/users/public/roles',
    CREATE_PATIENT: '/users/admin/crear-paciente',
    CREATE_USER: '/users/admin/crear-usuario'
  },
  APPOINTMENTS: {
    BASE: '/citas',
    DISPONIBILIDAD: '/citas/disponibilidad',
    CONFIRMATION: '/citas/confirmation'
  },
  PATIENTS: {
    BASE: '/pacientes',
    PROFILE: '/pacientes/profile',
    DOCUMENTS: '/pacientes/documents'
  },
  NOTIFICATIONS: '/notifications',
  WEBSOCKET: '/socket.io'
};

// Función de utilidad para construir URLs completas
export const buildUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Exportar la URL base para compatibilidad
export const BASE_URL = API_CONFIG.BASE_URL;
export default API_CONFIG;
