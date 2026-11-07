import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { ConnectionStatus, SubscriptionMessage, Metrics } from '../types';

interface WebSocketContextType {
  status: ConnectionStatus;
  error: string | null;
  subscriptions: SubscriptionMessage[];
  metrics: Metrics;
  reconnect: () => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  status: 'disconnected',
  error: null,
  subscriptions: [],
  metrics: { totalBandwidth: 0, totalConsumed: 0, count: 0 },
  reconnect: () => {},
  isConnected: false,
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionMessage[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalBandwidth: 0,
    totalConsumed: 0,
    count: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // En desarrollo con Vite proxy o en producción con Nginx, /ws apunta al backend
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    setStatus('connecting');
    setError(null);

    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setStatus('connected');
        setError(null);
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'INIT') {
            const data = payload.data;
            if (data.status) setStatus(data.status);
            if (data.error) setError(data.error);
            if (data.subscriptions) setSubscriptions(data.subscriptions);
            if (data.metrics) setMetrics(data.metrics);
          } else if (payload.type === 'STATUS') {
            if (payload.data?.status) setStatus(payload.data.status);
            if (payload.data?.error !== undefined) setError(payload.data.error);
          } else if (payload.type === 'SUBSCRIPTIONS') {
            if (payload.data?.subscriptions) setSubscriptions(payload.data.subscriptions);
            if (payload.data?.metrics) setMetrics(payload.data.metrics);
          }
        } catch (e) {
          console.error('Error parseando mensaje WS:', e);
        }
      };

      socket.onerror = (e) => {
        console.warn('Error en conexión WebSocket:', e);
        setStatus('error');
        setError('Error de comunicación con TVSPY Backend');
      };

      socket.onclose = () => {
        setStatus('disconnected');
        wsRef.current = null;
        // Reintento automático de reconexión tras 3 segundos
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connect();
          }, 3000);
        }
      };
    } catch (err: any) {
      setStatus('error');
      setError(err?.message || 'No se pudo iniciar WebSocket');
    }
  }, []);

  const reconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    connect();
  }, [connect]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return (
    <WebSocketContext.Provider
      value={{
        status,
        error,
        subscriptions,
        metrics,
        reconnect,
        isConnected: status === 'connected',
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
export default WebSocketContext;

