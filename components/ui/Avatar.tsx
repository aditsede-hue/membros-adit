type AvatarSize = "xs" | "sm" | "md" | "lg";

interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

// Deterministic color from name
function getColor(name: string) {
  const colors = [
    ["#fdf3d7", "#8b6314"],
    ["#d4ede5", "#1a5c42"],
    ["#dbeafe", "#1e40af"],
    ["#fce7f3", "#9d174d"],
    ["#ede9fe", "#5b21b6"],
    ["#fde8e6", "#9b1c1c"],
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function Avatar({ name, src, size = "md", className = "" }: AvatarProps) {
  const initials = getInitials(name);
  const [bg, fg] = getColor(name);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={[
          "rounded-full object-cover shrink-0",
          sizeClasses[size],
          className,
        ].join(" ")}
      />
    );
  }

  return (
    <span
      title={name}
      style={{ background: bg, color: fg }}
      className={[
        "rounded-full flex items-center justify-center font-semibold shrink-0 select-none",
        sizeClasses[size],
        className,
      ].join(" ")}
    >
      {initials}
    </span>
  );
}
