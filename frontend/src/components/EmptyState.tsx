import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-ndembo-border/30 flex items-center justify-center mb-4">
        <Icon size={24} className="text-ndembo-muted" />
      </div>
      <p className="text-sm font-semibold text-ndembo-text mb-1">{title}</p>
      <p className="text-xs text-ndembo-muted max-w-xs mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-ndembo-neon text-ndembo-bg text-sm font-bold px-4 py-2 rounded-lg hover:bg-ndembo-neonDim transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
