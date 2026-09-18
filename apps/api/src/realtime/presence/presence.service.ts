import { Injectable } from '@nestjs/common';

interface PresenceEntry {
  userId: string;
  username: string;
  roomId: string;
  socketIds: Set<string>;
  lastSeenAt: number;
}

@Injectable()
export class PresenceService {
  private readonly presence = new Map<string, PresenceEntry>();

  setOnline(entry: {
  userId: string;
  username: string;
  roomId: string;
  socketId: string;
  lastSeenAt: number;
}) {
  const key = `${entry.roomId}:${entry.userId}`;

  const existing = this.presence.get(key);

  if (existing) {
    existing.socketIds.add(entry.socketId);
    existing.lastSeenAt = Date.now();
    return;
  }

  this.presence.set(key, {
    userId: entry.userId,
    username: entry.username,
    roomId: entry.roomId,
    socketIds: new Set([entry.socketId]),
    lastSeenAt: Date.now(),
  });
}

  remove(socketId: string) {
  for (const [key, entry] of this.presence.entries()) {
    if (!entry.socketIds.has(socketId)) {
      continue;
    }

    entry.socketIds.delete(socketId);

    if (entry.socketIds.size === 0) {
      this.presence.delete(key);

      return {
        userId: entry.userId,
        username: entry.username,
        roomId: entry.roomId,
      };
    }

    return null;
  }

  return null;
}

  getRoomPresence(roomId: string) {
    return [...this.presence.values()].filter(
      (entry) => entry.roomId === roomId,
    );
  }
}