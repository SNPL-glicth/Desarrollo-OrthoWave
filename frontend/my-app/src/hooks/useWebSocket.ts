import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

interface WebSocketHook {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  reconnectAttempts: number;
}

export const useWebSocket = (): WebSocketHook => {
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts] = useState(0); // Eliminado setter no utilizado
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Si no hay usuario o token, no intentamos conectar
    if (!user || !token) {
      console.log('WebSocket: No user or token, skipping connection');
      return;
    }

    // Importar socket.io-client dinámicamente para evitar errores de SSR
    const connectSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        
        console.log('Connecting to WebSocket...');
        
        const socket = io('http://localhost:4000', {
          auth: {
            token: token
          },
          transports: ['websocket'],
          timeout: 10000,
          forceNew: true,
          reconnection: true,
          reconnectionAttempts: 3,
          reconnectionDelay: 1000
        });

        socket.on('connect', () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          setError(null);
        });

        socket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason);
          setIsConnected(false);
          
          if (reason === 'io server disconnect') {
            setError('Desconectado del servidor');
          } else {
            setError('Conexión perdida');
          }
        });

        socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          setError(`Error de conexión: ${error.message}`);
          setIsConnected(false);
        });

        socket.on('user_connected', (data) => {
          console.log('Usuario conectado:', data);
        });

        socket.on('user_disconnected', (data) => {
          console.log('Usuario desconectado:', data);
        });

        socketRef.current = socket;
      } catch (err) {
        console.error('Error creating socket:', err);
        setError('Error al crear la conexión WebSocket');
      }
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, token]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    reconnectAttempts
  };
};

export default useWebSocket;
