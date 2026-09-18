import { apiFetch } from '@/lib/api/client';

import type { RoomListItem } from './room.types';

export async function getMyRooms(
  accessToken: string,
) {
  return apiFetch<RoomListItem[]>('/rooms', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}