import type {
  MessageId,
  RoomId,
  Timestamp,
  UserId,
} from "@devroom/shared";

export interface ChatMessage {
  id: MessageId;
  roomId: RoomId;
  senderId: UserId;
  content: string;
  createdAt: Timestamp;
  sender: {
    id: UserId;
    username: string;
    avatarUrl: string | null;
  };
}