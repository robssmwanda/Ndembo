interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'table' | 'text';
  count?: number;
}

export function LoadingSkeleton({ variant = 'card', count = 3 }: LoadingSkeletonProps) {
  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-ndembo-card border border-ndembo-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="skeleton h-4 w-24 rounded" />
              <div className="skeleton h-4 w-12 rounded" />
            </div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="skeleton w-6 h-6 rounded-full" />
              <div className="skeleton h-4 flex-1 rounded" />
              <div className="skeleton h-4 w-6 rounded" />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="skeleton w-6 h-6 rounded-full" />
              <div className="skeleton h-4 flex-1 rounded" />
              <div className="skeleton h-4 w-6 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="bg-ndembo-card border border-ndembo-border rounded-xl overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border-b border-ndembo-border/50 last:border-0">
            <div className="skeleton h-4 w-12 rounded" />
            <div className="skeleton h-4 w-28 rounded hidden sm:block" />
            <div className="flex-1 flex items-center justify-center gap-2">
              <div className="skeleton w-6 h-6 rounded-full" />
              <div className="skeleton h-4 w-20 rounded" />
              <div className="skeleton h-4 w-6 rounded" />
              <div className="skeleton h-4 w-20 rounded" />
              <div className="skeleton w-6 h-6 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="bg-ndembo-card border border-ndembo-border rounded-xl overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border-b border-ndembo-border/50 last:border-0">
            <div className="skeleton h-4 w-6 rounded" />
            <div className="skeleton w-6 h-6 rounded-full" />
            <div className="skeleton h-4 flex-1 rounded" />
            <div className="skeleton h-4 w-8 rounded" />
            <div className="skeleton h-4 w-8 rounded" />
            <div className="skeleton h-4 w-8 rounded" />
            <div className="skeleton h-4 w-8 rounded" />
            <div className="skeleton h-4 w-10 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton h-4 w-full rounded" />
      ))}
    </div>
  );
}
