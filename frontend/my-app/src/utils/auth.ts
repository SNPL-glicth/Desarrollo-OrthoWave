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
  
  console.log('Datos de autenticación limpiados completamente');
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
