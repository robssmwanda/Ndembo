interface CompetitionBadgeProps {
  name: string;
  country?: string;
  size?: 'sm' | 'md';
}

export function CompetitionBadge({ name, country, size = 'sm' }: CompetitionBadgeProps) {
  const sizes = {
    sm: { badge: 'w-5 h-5 text-[8px]', text: 'text-[10px]' },
    md: { badge: 'w-7 h-7 text-[10px]', text: 'text-xs' },
  };

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`${sizes[size].badge} rounded bg-ndembo-border/50 flex items-center justify-center font-bold text-ndembo-muted flex-shrink-0`}
      >
        {name.substring(0, 2).toUpperCase()}
      </div>
      <span className={`${sizes[size].text} text-ndembo-muted truncate`}>
        {name}
        {country && <span className="text-ndembo-dim ml-1 hidden sm:inline">· {country}</span>}
      </span>
    </div>
  );
}
