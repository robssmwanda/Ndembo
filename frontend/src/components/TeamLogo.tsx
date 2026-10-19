interface TeamLogoProps {
  name: string;
  shortName?: string;
  size?: 'sm' | 'md' | 'lg';
}

function getColor(name: string): string {
  const colors = [
    '#A3FF4F', '#3B82F6', '#FF6B6B', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#EC4899', '#10B981', '#F97316', '#6366F1',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function TeamLogo({ name, shortName, size = 'md' }: TeamLogoProps) {
  const color = getColor(name);
  const display = shortName || name.substring(0, 3).toUpperCase();

  const sizes = {
    sm: 'w-6 h-6 text-[9px]',
    md: 'w-8 h-8 text-[10px]',
    lg: 'w-12 h-12 text-sm',
  };

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold flex-shrink-0 border`}
      style={{
        backgroundColor: `${color}20`,
        borderColor: `${color}40`,
        color: color,
      }}
    >
      {display}
    </div>
  );
}
