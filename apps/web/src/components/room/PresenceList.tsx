'use client';

import { Avatar } from '@/components/ui/Avatar';
import type { PresenceUser } from '@/features/presence/presence.types';

interface PresenceListProps {
  users: PresenceUser[];
}

export function PresenceList({
  users,
}: PresenceListProps) {
  return (
    <section className="border-b border-[var(--border)]">
      <div className="px-4 py-3">
        <h2 className="text-sm font-medium">
          Participants
        </h2>

        <p className="mt-1 text-xs text-[var(--muted)]">
          {users.length}{' '}
          {users.length === 1
            ? 'person'
            : 'people'}{' '}
          online
        </p>
      </div>

      <div className="space-y-1 px-3 pb-3">
        {users.map((user) => (
          <div
            key={user.userId}
            className="flex items-center gap-3 rounded-md px-2 py-2"
          >
            <div className="relative">
              <Avatar
                username={user.username}
                size="sm"
              />

              <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-[var(--background)] bg-[var(--success)]" />
            </div>

            <span className="truncate text-sm">
              {user.username}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}