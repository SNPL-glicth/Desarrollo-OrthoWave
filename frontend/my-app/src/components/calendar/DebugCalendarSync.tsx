import React, { useState, useEffect } from 'react';

interface DebugCalendarSyncProps {
  currentDate: Date;
  currentView: string;
  onForceToday?: () => void;
}

const DebugCalendarSync: React.FC<DebugCalendarSyncProps> = ({ currentDate, currentView }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const newLog = `[${new Date().toLocaleTimeString()}] Date changed: ${currentDate.toLocaleDateString()} | View: ${currentView}`;
    setLogs(prev => [...prev.slice(-9), newLog]); // Keep only last 10 logs
  }, [currentDate, currentView]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 z-50"
      >
        Debug Calendar
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-3 w-80 z-50">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold text-gray-800">Calendar Debug</h4>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      
      <div className="text-xs space-y-1">
        <div><strong>System Date:</strong> {new Date().toLocaleDateString('es')}</div>
        <div><strong>System Time:</strong> {new Date().toLocaleTimeString('es')}</div>
        <div><strong>System ISO:</strong> {new Date().toISOString()}</div>
        <div><strong>Calendar Date:</strong> {currentDate.toLocaleDateString('es')}</div>
        <div><strong>Calendar Time:</strong> {currentDate.toLocaleTimeString('es')}</div>
        <div><strong>Calendar ISO:</strong> {currentDate.toISOString()}</div>
        <div><strong>Current View:</strong> {currentView}</div>
        <div><strong>System TZ:</strong> {Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
        <div><strong>App TZ:</strong> America/Bogota</div>
        <div><strong>Bogotá Time:</strong> {new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</div>
        <div className={`${new Date().toDateString() === currentDate.toDateString() ? 'text-green-600' : 'text-red-600'}`}>
          <strong>Date Match:</strong> {new Date().toDateString() === currentDate.toDateString() ? '✓ YES' : '✗ NO'}
        </div>
        <div className={`${Math.abs(new Date().getTime() - currentDate.getTime()) < 60000 ? 'text-green-600' : 'text-yellow-600'}`}>
          <strong>Time Diff:</strong> {Math.round((new Date().getTime() - currentDate.getTime()) / 1000)}s
        </div>
      </div>

      <div className="mt-3">
        <div className="text-xs font-semibold text-gray-600 mb-1">Recent Changes:</div>
        <div className="max-h-32 overflow-y-auto text-xs text-gray-700">
          {logs.map((log, index) => (
            <div key={index} className="mb-1 break-words">
              {log}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setLogs([])}
        className="mt-2 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded w-full"
      >
        Clear Logs
      </button>
    </div>
  );
};

export default DebugCalendarSync;
