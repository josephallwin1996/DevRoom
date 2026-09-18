'use client';

import { useEffect, useRef, useState } from 'react';

import type { Socket } from 'socket.io-client';

import { createSocket } from '@/lib/websocket/client';

export function useWebSocket(
  accessToken: string | null,
) {
  const socketRef = useRef<Socket | null>(null);

  const [isConnected, setIsConnected] =
    useState(false);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const socket = createSocket(accessToken);

    socketRef.current = socket;

    function handleConnect() {
      setIsConnected(true);
      console.log(
        'WebSocket connected:',
        socket.id,
      );
    }

    function handleDisconnect() {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    }

    function handleReady(event: unknown) {
      console.log(
        'WebSocket ready:',
        event,
      );
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connection.ready', handleReady);

    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off(
        'disconnect',
        handleDisconnect,
      );
      socket.off(
        'connection.ready',
        handleReady,
      );

      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [accessToken]);

  return {
    socket: socketRef.current,
    isConnected,
  };
}