interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function Badge({
  children,
  variant = 'default',
}: BadgeProps) {
  const variants = {
    default:
      'bg-[var(--surface-hover)] text-[var(--muted)]',

    success:
      'bg-[var(--success)]/15 text-[var(--success)]',

    warning:
      'bg-[var(--warning)]/15 text-[var(--warning)]',

    danger:
      'bg-[var(--danger)]/15 text-[var(--danger)]',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}