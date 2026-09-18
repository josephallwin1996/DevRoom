import type { ClientEvent } from '@devroom/shared';

export interface JoinRoomPayload {
  roomId: string;
}

export type JoinRoomEvent = ClientEvent<JoinRoomPayload>;