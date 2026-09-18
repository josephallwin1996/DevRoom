interface AvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({
  username,
  avatarUrl,
  size = 'md',
}: AvatarProps) {
  const sizes = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const initial =
    username.trim().charAt(0).toUpperCase();

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-hover)] font-medium text-[var(--foreground)] ${sizes[size]}`}
      title={username}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${username}'s avatar`}
          className="h-full w-full object-cover"
        />
      ) : (
        initial
      )}
    </div>
  );
}