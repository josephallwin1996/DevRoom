import type { RoomRole, RoomId, UserId, Timestamp } from '@devroom/shared';

export interface RoomListItem {
  id: RoomId;
  name: string;
  ownerId: UserId;
  role: RoomRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}