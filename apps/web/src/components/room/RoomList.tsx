'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/providers/AuthProvider';
import { getMyRooms } from '@/features/room/room.api';
import type { RoomListItem } from '@/features/room/room.types';

export function RoomList() {
  const router = useRouter();
  const { accessToken } = useAuth();

  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    setIsLoading(true);
    setError('');

    getMyRooms(accessToken)
      .then(setRooms)
      .catch(() => {
        setError('Unable to load rooms.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [accessToken]);

  if (isLoading) {
    return (
      <div className="px-3 py-2 text-sm text-[var(--muted)]">
        Loading rooms...
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 py-2 text-sm text-[var(--danger)]">
        {error}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="px-3 py-2 text-sm text-[var(--muted)]">
        No rooms yet.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {rooms.map((room) => (
        <button
          key={room.id}
          type="button"
          onClick={() => router.push(`/rooms/${room.id}`)}
          className="w-full rounded-md px-3 py-2 text-left text-sm text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
        >
          <div className="truncate font-medium">
            {room.name}
          </div>

          <div className="mt-0.5 text-xs text-[var(--muted-foreground)]">
            {room.role}
          </div>
        </button>
      ))}
    </div>
  );
}