// Script de inicialización para desarrollo
// Este archivo se ejecuta al inicio de la aplicación para asegurar un estado limpio

import { forceLogout } from './auth';

// Función para limpiar COMPLETAMENTE cualquier rastro de autenticación
export const forceCleanAuthData = () => {
  // Limpiar localStorage (excepto nuestra flag de control)
  const localStorageKeys = Object.keys(localStorage);
  localStorageKeys.forEach(key => {
    const keyLower = key.toLowerCase();
    // No limpiar nuestra flag de control
    if (key !== '__dev_cleaned__' && (keyLower.includes('token') || keyLower.includes('user') || keyLower.includes('auth'))) {
      localStorage.removeItem(key);
      console.log(`🧹 Eliminado de localStorage: ${key}`);
    }
  });

  // Limpiar sessionStorage (excepto nuestra flag de control)
  const sessionStorageKeys = Object.keys(sessionStorage);
  sessionStorageKeys.forEach(key => {
    const keyLower = key.toLowerCase();
    // No limpiar nuestra flag de control
    if (key !== '__dev_cleaned__' && (keyLower.includes('token') || keyLower.includes('user') || keyLower.includes('auth'))) {
      sessionStorage.removeItem(key);
      console.log(`🧹 Eliminado de sessionStorage: ${key}`);
    }
  });

  // Limpiar cookies relacionadas con autenticación
  document.cookie.split(";").forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    const nameLower = name.toLowerCase();
    if (nameLower.includes('token') || nameLower.includes('user') || nameLower.includes('auth')) {
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      console.log(`🧹 Eliminada cookie: ${name}`);
    }
  });

  console.log('🧽 Limpieza completa de datos de autenticación terminada');
};

// Función para limpiar completamente el estado de autenticación en desarrollo
export const initDevEnvironment = () => {
  // Solo ejecutar en modo desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Inicializando entorno de desarrollo...');
    
    // Verificar si ya se hizo la limpieza inicial en esta sesión del navegador
    const alreadyCleaned = sessionStorage.getItem('__dev_cleaned__');
    
    if (!alreadyCleaned) {
      // Solo limpiar en la primera carga de la sesión del navegador
      const hasToken = localStorage.getItem('token');
      const hasUser = localStorage.getItem('user');
      
      if (hasToken || hasUser) {
        console.log('⚠️  Primer acceso - limpiando datos de sesión previa...');
        forceCleanAuthData();
        console.log('✅ Sesión limpiada - empezando con estado limpio');
      } else {
        console.log('✅ No se encontraron datos de sesión previa');
      }
      
      // Marcar que ya se hizo la limpieza inicial en esta sesión del navegador
      sessionStorage.setItem('__dev_cleaned__', 'true');
      console.log('🏠 Después de esto, la sesión funciona normalmente');
    } else {
      console.log('💡 Limpieza inicial ya realizada');
      console.log('📝 La sesión funciona normalmente - se mantiene si te logueas');
    }
    
    console.log('🚀 Entorno de desarrollo inicializado correctamente');
  }
};

// Función para mostrar información de depuración en desarrollo
export const logDevInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('=== INFORMACIÓN DE DESARROLLO ===');
    console.log('🌐 Entorno:', process.env.NODE_ENV);
    console.log('🔐 Token almacenado:', !!localStorage.getItem('token'));
    console.log('👤 Usuario almacenado:', !!localStorage.getItem('user'));
    console.log('🚪 Estado de autenticación limpio:', !localStorage.getItem('token') && !localStorage.getItem('user'));
    console.log('===================================');
  }
};

// Función para resetear completamente la aplicación en desarrollo
export const resetAppState = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Reseteando estado completo de la aplicación...');
    
    // Limpiar localStorage y sessionStorage completamente
    localStorage.clear();
    sessionStorage.clear();
    
    // Limpiar cookies
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
    });
    
    console.log('✅ Estado de la aplicación reseteado completamente');
    
    // Recargar la página para asegurar un estado completamente limpio
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
};
