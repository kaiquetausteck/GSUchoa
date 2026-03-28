type PanelUserAvatarProps = {
  avatarUrl?: string | null;
  className?: string;
  name: string;
  roundedClassName?: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function PanelUserAvatar({
  avatarUrl,
  className = "h-12 w-12",
  name,
  roundedClassName = "rounded-2xl",
}: PanelUserAvatarProps) {
  if (avatarUrl) {
    return (
      <img
        alt={name}
        className={`${className} ${roundedClassName} object-cover`}
        src={avatarUrl}
      />
    );
  }

  return (
    <div
      aria-label={name}
      className={`flex items-center justify-center bg-primary/10 font-bold text-primary ${className} ${roundedClassName}`}
      role="img"
    >
      {getInitials(name)}
    </div>
  );
}
