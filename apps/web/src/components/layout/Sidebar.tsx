import { RoomList } from '../room/RoomList';

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  open = false,
  onClose,
}: SidebarProps) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[var(--sidebar-width)]
          border-r border-[var(--border)]
          bg-[var(--background)]
          transition-transform duration-200
          md:static md:z-auto md:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-[var(--border)] p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              Workspace
            </p>
          </div>

          <nav className="flex-1 space-y-1 p-3">
             <div>
            <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              My Rooms
            </p>

            <RoomList />
          </div>
          </nav>

          <div className="border-t border-[var(--border)] p-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-md px-3 py-2 text-left text-sm text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] md:hidden"
            >
              Close
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}