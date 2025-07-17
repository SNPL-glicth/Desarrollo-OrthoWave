import React from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface RealtimeStatusProps {
  className?: string;
}

export const RealtimeStatus: React.FC<RealtimeStatusProps> = ({ className = '' }) => {
  const { isConnected, error, reconnectAttempts } = useWebSocket();

  const getStatusColor = () => {
    if (isConnected) return 'bg-green-500';
    if (error) return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const getStatusText = () => {
    if (isConnected) return 'Conectado';
    if (error) return 'Desconectado';
    return 'Conectando...';
  };

  const getStatusIcon = () => {
    if (isConnected) {
      return (
        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (error) {
      return (
        <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    }
    
    return (
      <svg className="w-3 h-3 text-yellow-500 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    );
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        {getStatusIcon()}
        <span className="text-xs font-medium text-gray-600">
          {getStatusText()}
        </span>
      </div>
      
      {/* Indicador de pulso para conexión activa */}
      <div className={`relative ${isConnected ? 'block' : 'hidden'}`}>
        <div className="w-2 h-2 rounded-full bg-green-500">
          <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
        </div>
      </div>
      
      {/* Contador de intentos de reconexión */}
      {reconnectAttempts > 0 && !isConnected && (
        <span className="text-xs text-gray-500">
          Reintentando ({reconnectAttempts}/5)
        </span>
      )}
      
      {/* Tooltip con información adicional */}
      <div className="group relative">
        <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
          {isConnected ? (
            <>
              <div>✓ Actualizaciones en tiempo real activas</div>
              <div>Los datos se actualizan automáticamente</div>
            </>
          ) : error ? (
            <>
              <div>✗ Sin conexión en tiempo real</div>
              <div>Datos actualizados periódicamente</div>
              <div className="text-red-300">Error: {error}</div>
            </>
          ) : (
            <>
              <div>🔄 Estableciendo conexión...</div>
              <div>Conectando al servidor de actualizaciones</div>
            </>
          )}
          
          {/* Flecha del tooltip */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeStatus;
