'use client';

import { useEffect, useState } from 'react';

import type { PresenceUser } from '@/features/presence/presence.types';
import { useWebSocket } from '@/providers/WebSocketProvider';

export function useRoomRealtime(
  roomId: string | null,
) {
  const { socket, isConnected } =
    useWebSocket();

  const [presenceUsers, setPresenceUsers] =
    useState<PresenceUser[]>([]);

  useEffect(() => {
    if (
      !socket ||
      !isConnected ||
      !roomId
    ) {
      return;
    }

    function handleJoined(event: unknown) {
      console.log(
        'Room joined:',
        event,
      );
    }

    function handlePresenceSnapshot(
      event: unknown,
    ) {
      const data = event as {
        payload?: {
          roomId?: string;
          users?: PresenceUser[];
        };
      };

      if (
        data.payload?.roomId !== roomId ||
        !data.payload.users
      ) {
        return;
      }

      setPresenceUsers(
        data.payload.users,
      );
    }

    function handlePresenceChanged(
      event: unknown,
    ) {
      const data = event as {
        payload?: {
          roomId?: string;
          user?: {
            userId: string;
            username: string;
          };
          status?: 'online' | 'offline';
        };
      };

      const payload = data.payload;

      if (
        payload?.roomId !== roomId ||
        !payload.user ||
        !payload.status
      ) {
        return;
      }

      setPresenceUsers(
        (currentUsers) => {
          if (
            payload.status === 'online'
          ) {
            const alreadyOnline =
              currentUsers.some(
                (user) =>
                  user.userId ===
                  payload.user?.userId,
              );

            if (alreadyOnline) {
              return currentUsers;
            }

            return [
              ...currentUsers,
              {
                userId:
                  payload.user.userId,
                username:
                  payload.user.username,
                lastSeenAt:
                  Date.now(),
              },
            ];
          }

          return currentUsers.filter(
            (user) =>
              user.userId !==
              payload.user?.userId,
          );
        },
      );
    }

    function handleError(
      event: unknown,
    ) {
      console.error(
        'Room realtime error:',
        event,
      );
    }

    socket.on(
      'room.joined',
      handleJoined,
    );

    socket.on(
      'presence.snapshot',
      handlePresenceSnapshot,
    );

    socket.on(
      'presence.changed',
      handlePresenceChanged,
    );

    socket.on(
      'error',
      handleError,
    );

    const requestId =
      crypto.randomUUID();

    socket.emit('room.join', {
      type: 'room.join',
      requestId,
      timestamp: Date.now(),
      payload: {
        roomId,
      },
    });

    return () => {
      socket.off(
        'room.joined',
        handleJoined,
      );

      socket.off(
        'presence.snapshot',
        handlePresenceSnapshot,
      );

      socket.off(
        'presence.changed',
        handlePresenceChanged,
      );

      socket.off(
        'error',
        handleError,
      );
    };
  }, [
    socket,
    isConnected,
    roomId,
  ]);

  return {
    presenceUsers,
    isConnected,
  };
}