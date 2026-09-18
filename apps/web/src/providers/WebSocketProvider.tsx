'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import type { Socket } from 'socket.io-client';

import { useAuth } from './AuthProvider';
import { createSocket } from '@/lib/websocket/client';

interface WebSocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const WebSocketContext =
  createContext<WebSocketContextValue | undefined>(
    undefined,
  );

export function WebSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { accessToken } = useAuth();

  const [socket, setSocket] =
    useState<Socket | null>(null);

  const [isConnected, setIsConnected] =
    useState(false);

  useEffect(() => {
    if (!accessToken) {
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const newSocket = createSocket(accessToken);

    function handleConnect() {
      setIsConnected(true);

      console.log(
        'WebSocket connected:',
        newSocket.id,
      );
    }

    function handleDisconnect() {
      setIsConnected(false);

      console.log(
        'WebSocket disconnected',
      );
    }

    function handleReady(event: unknown) {
      console.log(
        'WebSocket ready:',
        event,
      );
    }

    newSocket.on('connect', handleConnect);
    newSocket.on(
      'disconnect',
      handleDisconnect,
    );
    newSocket.on(
      'connection.ready',
      handleReady,
    );

    setSocket(newSocket);

    newSocket.connect();

    return () => {
      newSocket.off(
        'connect',
        handleConnect,
      );

      newSocket.off(
        'disconnect',
        handleDisconnect,
      );

      newSocket.off(
        'connection.ready',
        handleReady,
      );

      newSocket.disconnect();

      setSocket(null);
      setIsConnected(false);
    };
  }, [accessToken]);

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isConnected,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context =
    useContext(WebSocketContext);

  if (!context) {
    throw new Error(
      'useWebSocket must be used inside WebSocketProvider',
    );
  }

  return context;
}