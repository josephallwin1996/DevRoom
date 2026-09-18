import { Avatar } from '../ui/Avatar';

interface HeaderProps {
  username?: string;
  avatarUrl?: string | null;
  onMenuClick?: () => void;
  onLogout?: () => void;
}

export function Header({
  username = 'User',
  avatarUrl,
  onMenuClick,
  onLogout
}: HeaderProps) {
  return (
    <header className="flex h-[var(--header-height)] items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md p-2 text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] md:hidden"
          aria-label="Open navigation"
        >
          ☰
        </button>

        <div className="text-lg font-semibold tracking-tight">
          DevRoom
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Avatar
          username={username}
          avatarUrl={avatarUrl}
          size="sm"
        />

        <span className="hidden text-sm text-[var(--muted)] sm:block">
          {username}
        </span>
        <button
        type="button"
        onClick={onLogout}
        className="rounded-md px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
      >
        Logout
      </button>
      </div>
      
    </header>
  );
}