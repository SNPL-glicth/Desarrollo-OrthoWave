// Utility functions for authentication
export const clearAuthData = () => {
  // Lista de todas las claves relacionadas con autenticación
  const authKeys = [
    'token',
    'user',
    'refreshToken',
    'access_token',
    'userRole',
    'userId',
    'authData'
  ];
  
  authKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  // Limpiar cualquier clave que contenga términos relacionados con autenticación
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (key.toLowerCase().includes('auth') || 
        key.toLowerCase().includes('token') || 
        key.toLowerCase().includes('user') ||
        key.toLowerCase().includes('session')) {
      localStorage.removeItem(key);
    }
  });

  const allSessionKeys = Object.keys(sessionStorage);
  allSessionKeys.forEach(key => {
    if (key.toLowerCase().includes('auth') || 
        key.toLowerCase().includes('token') || 
        key.toLowerCase().includes('user') ||
        key.toLowerCase().includes('session')) {
      sessionStorage.removeItem(key);
    }
  });
  
  console.log('Datos de autenticación limpiados completamente');
};

// Función para forzar la limpieza de todas las sesiones
export const forceLogout = () => {
  clearAuthData();
  
  // Limpiar cookies relacionadas con autenticación
  document.cookie.split(";").forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    if (name.toLowerCase().includes('auth') || 
        name.toLowerCase().includes('token') || 
        name.toLowerCase().includes('user')) {
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
    }
  });

  console.log('Sesión forzosamente cerrada y limpiada');
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error al verificar token:', error);
    return true; // Si no se puede verificar, consideramos que está expirado
  }
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const getStoredUser = (): any | null => {
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error al parsear usuario almacenado:', error);
      return null;
    }
  }
  return null;
};
