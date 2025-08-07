import React, { useState, useEffect } from 'react';
import { getCurrentTimeString, getCurrentDateTimeString, getCurrentColombiaDate } from '../../utils/dateUtils';

interface ColombiaTimeWidgetProps {
  className?: string;
  showDate?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ColombiaTimeWidget: React.FC<ColombiaTimeWidgetProps> = ({
  className = '',
  showDate = true,
  size = 'md'
}) => {
  const [currentTime, setCurrentTime] = useState<string>(getCurrentTimeString());
  const [currentDateTime, setCurrentDateTime] = useState<string>(getCurrentDateTimeString());
  const [debugInfo, setDebugInfo] = useState<{
    localTime: string;
    colombiaTime: string;
    utcTime: string;
    offset: number;
  }>(() => {
    const now = new Date();
    const colombiaDate = getCurrentColombiaDate();
    return {
      localTime: now.toLocaleTimeString(),
      colombiaTime: colombiaDate.toLocaleTimeString(),
      utcTime: now.toISOString(),
      offset: now.getTimezoneOffset()
    };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTimeString());
      if (showDate) {
        setCurrentDateTime(getCurrentDateTimeString());
      }
      
      // Actualizar debug info
      const now = new Date();
      const colombiaDate = getCurrentColombiaDate();
      setDebugInfo({
        localTime: now.toLocaleTimeString(),
        colombiaTime: colombiaDate.toLocaleTimeString(),
        utcTime: now.toISOString(),
        offset: now.getTimezoneOffset()
      });
    }, 1000); // Actualizar cada segundo

    return () => clearInterval(interval);
  }, [showDate]);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const formatDateTime = (dateTimeString: string) => {
    const parts = dateTimeString.split(' ');
    if (parts.length >= 2) {
      return {
        date: parts[0],
        time: parts[1]
      };
    }
    return {
      date: '',
      time: dateTimeString
    };
  };

  const formatted = showDate ? formatDateTime(currentDateTime) : { date: '', time: currentTime };

  return (
    <div className={`flex flex-col items-center p-3 bg-blue-50 rounded-lg border border-blue-200 ${className}`}>
      <div className="flex items-center space-x-2 mb-1">
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-xs font-medium text-blue-800">Hora Colombia</span>
      </div>
      
      <div className="text-center">
        <div className={`font-mono font-bold text-blue-900 ${sizeClasses[size]}`}>
          {formatted.time}
        </div>
        {showDate && formatted.date && (
          <div className="text-xs text-blue-700 mt-1">
            {formatted.date}
          </div>
        )}
      </div>
      
      <div className="text-xs text-blue-600 mt-1 text-center">
        UTC-5 (COT)
      </div>
      
      {/* Debug info - solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-blue-600 space-y-1">
          <div><strong>Local:</strong> {debugInfo.localTime}</div>
          <div><strong>Colombia:</strong> {debugInfo.colombiaTime}</div>
          <div><strong>Offset:</strong> {debugInfo.offset}min</div>
        </div>
      )}
    </div>
  );
};

export default ColombiaTimeWidget;
