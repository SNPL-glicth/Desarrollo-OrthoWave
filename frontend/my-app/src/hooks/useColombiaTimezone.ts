/**
 * Hook para inicializar y manejar el timezone de Colombia en toda la aplicación
 * Se debe usar en App.tsx para configurar el timezone al cargar la aplicación
 */

import { useEffect } from 'react';
import { initializeColombiaTimezone, getColombiaTimeInfo } from '../utils/timezoneUtils';

export const useColombiaTimezone = () => {
  useEffect(() => {
    // Inicializar timezone al montar la aplicación
    initializeColombiaTimezone();
    
    // Solo en desarrollo, mostrar información de timezone cada 30 segundos
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        const info = getColombiaTimeInfo();
        console.log('🕐 Timezone Colombia Info:', info);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, []);
  
  // Función para obtener información actual de timezone
  const getTimezoneInfo = () => getColombiaTimeInfo();
  
  return {
    getTimezoneInfo
  };
};
