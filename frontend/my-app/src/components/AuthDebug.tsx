import React from 'react';
import { clearAuthData } from '../utils/auth';

const AuthDebug: React.FC = () => {
  const handleClearAuth = () => {
    clearAuthData();
    window.location.reload();
  };

  const checkLocalStorage = () => {
    const keys = ['token', 'user', 'refreshToken', 'access_token', 'userRole', 'userId', 'authData'];
    console.log('=== Estado de localStorage ===');
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      console.log(`${key}:`, value ? 'PRESENTE' : 'AUSENTE');
    });
    console.log('==============================');
  };

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: '#f0f0f0', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <div style={{ marginBottom: '5px' }}>
        <strong>Debug Auth</strong>
      </div>
      <button 
        onClick={handleClearAuth}
        style={{ 
          marginRight: '5px', 
          padding: '2px 5px', 
          fontSize: '10px',
          backgroundColor: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: '3px'
        }}
      >
        Limpiar Auth
      </button>
      <button 
        onClick={checkLocalStorage}
        style={{ 
          padding: '2px 5px', 
          fontSize: '10px',
          backgroundColor: '#4444ff',
          color: 'white',
          border: 'none',
          borderRadius: '3px'
        }}
      >
        Check Storage
      </button>
    </div>
  );
};

export default AuthDebug;
