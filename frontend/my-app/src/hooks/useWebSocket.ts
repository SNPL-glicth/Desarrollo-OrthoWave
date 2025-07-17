import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
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
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    const connectSocket = () => {
      try {
        console.log('Connecting to WebSocket...');
        
        const socket = io('http://localhost:4000', {
          auth: {
            token: token
          },
          transports: ['websocket'],
          timeout: 10000,
          forceNew: true
        });

        socket.on('connect', () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          setError(null);
          setReconnectAttempts(0);
        });

        socket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason);
          setIsConnected(false);
          
          // Intentar reconectar si la desconexión no fue intencional
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
          
          // Incrementar intentos de reconexión
          setReconnectAttempts(prev => prev + 1);
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

  // Intentar reconectar automáticamente
  useEffect(() => {
    if (!isConnected && reconnectAttempts > 0 && reconnectAttempts < 5) {
      const timer = setTimeout(() => {
        console.log(`Intentando reconectar... (${reconnectAttempts}/5)`);
        if (socketRef.current) {
          socketRef.current.connect();
        }
      }, 3000 * reconnectAttempts);

      return () => clearTimeout(timer);
    }
  }, [isConnected, reconnectAttempts]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    reconnectAttempts
  };
};

export default useWebSocket;
