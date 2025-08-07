import React, { useState, useEffect } from 'react';
import { getCurrentTimeString, getCurrentDateTimeString, getCurrentColombiaDate, TIMEZONE } from '../../utils/dateUtils';

const TimeDebugComponent: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [info, setInfo] = useState({
    systemTime: new Date().toLocaleString(),
    systemUTC: new Date().toISOString(),
    colombiaTimeString: getCurrentTimeString(),
    colombiaDateTimeString: getCurrentDateTimeString(),
    colombiaDateObject: getCurrentColombiaDate().toLocaleString(),
    timezoneOffset: new Date().getTimezoneOffset(),
    configuredTimezone: TIMEZONE
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setInfo({
        systemTime: new Date().toLocaleString(),
        systemUTC: new Date().toISOString(),
        colombiaTimeString: getCurrentTimeString(),
        colombiaDateTimeString: getCurrentDateTimeString(),
        colombiaDateObject: getCurrentColombiaDate().toLocaleString(),
        timezoneOffset: new Date().getTimezoneOffset(),
        configuredTimezone: TIMEZONE
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg border max-w-md text-xs z-50">
      {/* Header colapsable */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-bold text-sm flex items-center">
          🕒 Debug Tiempo
          <span className="ml-2 text-blue-600">{info.colombiaTimeString}</span>
        </h3>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {/* Contenido expandible */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t">
          <div className="space-y-1 mt-2">
            <div><strong>Sistema Local:</strong> {info.systemTime}</div>
            <div><strong>Sistema UTC:</strong> {info.systemUTC}</div>
            <div><strong>Colombia String:</strong> {info.colombiaTimeString}</div>
            <div><strong>Colombia DateTime:</strong> {info.colombiaDateTimeString}</div>
            <div><strong>Colombia Object:</strong> {info.colombiaDateObject}</div>
            <div><strong>Offset Local:</strong> {info.timezoneOffset} min</div>
            <div><strong>Configurado:</strong> {info.configuredTimezone}</div>
          </div>

          <div className="mt-2 pt-2 border-t">
            <div className="text-xs text-gray-600">
              Deberías ver Colombia 5 horas atrás de UTC<br/>
              Ejemplo: Si UTC es 23:00, Colombia = 18:00
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeDebugComponent;
