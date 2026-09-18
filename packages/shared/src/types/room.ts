import type {
  RoomId,
  Timestamp,
  UserId,
} from './ids';

import type { User } from './user';

export type RoomRole =
  | 'OWNER'
  | 'ADMIN'
  | 'MEMBER';

export interface Room {
  id: RoomId;
  name: string;
  ownerId: UserId;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface RoomMember {
  user: User;
  role: RoomRole;
  joinedAt: Timestamp;
}