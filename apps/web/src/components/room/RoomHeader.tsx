interface RoomHeaderProps {
  roomName: string;
}

export function RoomHeader({
  roomName,
}: RoomHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4">
      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold">
          {roomName}
        </h1>

        <p className="text-xs text-[var(--muted)]">
          Collaborative workspace
        </p>
      </div>
    </header>
  );
}