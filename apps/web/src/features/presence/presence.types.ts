import type {
  RoomId,
  Timestamp,
  UserId,
} from '@devroom/shared';

export interface PresenceUser {
  userId: UserId;
  username: string;
  lastSeenAt: Timestamp | number;
}

export interface PresenceSnapshot {
  roomId: RoomId;
  users: PresenceUser[];
}