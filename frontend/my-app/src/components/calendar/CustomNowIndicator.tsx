import React, { useState, useEffect, useRef } from 'react';
import { getCurrentTimeString, TIMEZONE } from '../../utils/dateUtils';

interface CustomNowIndicatorProps {
  view: string;
  className?: string;
}

const CustomNowIndicator: React.FC<CustomNowIndicatorProps> = ({ 
  view, 
  className = '' 
}) => {
  const [currentTime, setCurrentTime] = useState<{
    hours: number;
    minutes: number;
    timeString: string;
  }>(() => {
    const now = new Date();
    const colombiaTimeFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const parts = colombiaTimeFormatter.formatToParts(now);
    const hours = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
    const minutes = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
    
    return {
      hours,
      minutes,
      timeString: getCurrentTimeString()
    };
  });

  const [pixelPosition, setPixelPosition] = useState<number>(0);
  const indicatorRef = useRef<HTMLDivElement>(null);

  // Función para calcular la posición real basándose en el DOM de FullCalendar
  const calculatePositionFromDOM = () => {
    try {
      const currentHour = currentTime.hours;
      const currentMinutes = currentTime.minutes;
      
      // Buscar directamente la etiqueta de la hora actual o la anterior
      const possibleHours = [currentHour, currentHour - 1, currentHour - 2];
      let targetLabel: Element | null = null;
      let targetHour = 0;
      
      for (const hour of possibleHours) {
        if (hour >= 6 && hour <= 22) { // Dentro del rango del calendario
          const selector = `.fc-timegrid-slot-label`;
          const labels = document.querySelectorAll(selector);
          
          for (const label of Array.from(labels)) {
            const text = label.textContent?.trim();
            if (text && text.includes(`${hour}:00`)) {
              targetLabel = label;
              targetHour = hour;
              break;
            }
          }
          
          if (targetLabel) break;
        }
      }
      
      if (targetLabel) {
        const calendarBody = document.querySelector('.fc-timegrid-body');
        
        if (calendarBody) {
          const labelElement = targetLabel as Element;
          const bodyElement = calendarBody as Element;
          
          const labelRect = labelElement.getBoundingClientRect();
          const bodyRect = bodyElement.getBoundingClientRect();
          
          // Calcular offset basado en minutos
          const minutesPastTargetHour = (currentHour - targetHour) * 60 + currentMinutes;
          const pixelsPerHour = 144; // Altura aproximada por hora
          const pixelOffset = (minutesPastTargetHour / 60) * pixelsPerHour;
          
          const topPosition = (labelRect.top - bodyRect.top) + pixelOffset;
          
          console.log('🎯 Posición calculada:', {
            hora: `${currentHour}:${currentMinutes.toString().padStart(2, '0')}`,
            horaObjetivo: `${targetHour}:00`,
            minutosOffset: minutesPastTargetHour,
            pixelesOffset: Math.round(pixelOffset),
            posicionFinal: Math.round(topPosition)
          });
          
          return Math.max(0, topPosition);
        }
      }
    } catch (error) {
      console.warn('Error calculando posición:', error);
    }
    
    return 0;
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const colombiaTimeFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const parts = colombiaTimeFormatter.formatToParts(now);
      const hours = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
      const minutes = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
      
      setCurrentTime({
        hours,
        minutes,
        timeString: getCurrentTimeString()
      });
    };

    // Actualizar inmediatamente
    updateTime();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(updateTime, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Actualizar posición basándose en el DOM cuando cambie la hora
  useEffect(() => {
    const updatePosition = () => {
      const newPosition = calculatePositionFromDOM();
      setPixelPosition(newPosition);
    };

    // Múltiples intentos para asegurar que el DOM esté listo
    const timeouts = [
      setTimeout(updatePosition, 100),
      setTimeout(updatePosition, 500),
      setTimeout(updatePosition, 1000)
    ];

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [currentTime]);

  // Solo mostrar en vistas de tiempo (no en vista de mes)
  if (!view.includes('timeGrid')) {
    return null;
  }

  return (
    <div 
      ref={indicatorRef}
      className={`custom-now-indicator ${className}`}
      style={{
        top: `${pixelPosition}px`,
        transform: 'translateY(-1px)',
        position: 'absolute',
        left: '60px',
        right: '20px',
        zIndex: 10,
        pointerEvents: 'none'
      }}
    >
      {/* Línea roja */}
      <div className="custom-now-indicator-line">
        <div className="custom-now-indicator-dot"></div>
      </div>
      
      {/* Tooltip con la hora */}
      <div className="custom-now-indicator-tooltip">
        {currentTime.timeString} COT
      </div>
    </div>
  );
};

export default CustomNowIndicator;
