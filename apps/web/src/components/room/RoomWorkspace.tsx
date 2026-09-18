
"use client";

import type { PresenceUser } from "@/features/presence/presence.types";
import { PresenceList } from "./PresenceList";
import { ChatPanel } from "./ChatPanel";

interface RoomWorkspaceProps {
  roomId: string;
  roomName: string;
  accessToken: string;
  presenceUsers: PresenceUser[];
}

export function RoomWorkspace({
  roomId,
  roomName,
  accessToken,
  presenceUsers,
}: RoomWorkspaceProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Room header */}
      <div className="flex h-14 shrink-0 items-center border-b border-[var(--border)] px-4">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold">
            {roomName}
          </h1>

          <p className="text-xs text-[var(--muted)]">
            Collaborative workspace
          </p>
        </div>
      </div>

      {/* Room content */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_320px]">
        {/* Main workspace */}
        <section className="min-h-[400px] min-w-0 border-b border-[var(--border)] lg:min-h-0 lg:border-b-0 lg:border-r">
          <div className="flex h-full items-center justify-center p-6">
            <div className="text-center">
              <h2 className="text-lg font-medium">
                Workspace
              </h2>

              <p className="mt-2 text-sm text-[var(--muted)]">
                Editor and developer tools will live
                here.
              </p>
            </div>
          </div>
        </section>

        {/* Right panel */}
        <aside className="flex min-h-0 flex-col">
          {/* Presence */}
          <div className="shrink-0">
            <PresenceList
              users={presenceUsers}
            />
          </div>

          {/* Chat */}
          <div className="flex min-h-0 flex-1 flex-col">
            <ChatPanel
              roomId={roomId}
              accessToken={accessToken}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

