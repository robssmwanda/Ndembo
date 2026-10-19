import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-ndembo-live/10 flex items-center justify-center mb-4">
        <AlertCircle size={24} className="text-ndembo-live" />
      </div>
      <p className="text-sm text-ndembo-text mb-1 font-medium">
        {message || 'Une erreur est survenue lors du chargement des données.'}
      </p>
      <p className="text-xs text-ndembo-muted mb-4">Vérifiez votre connexion et réessayez.</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-ndembo-card border border-ndembo-border text-ndembo-text text-sm px-4 py-2 rounded-lg hover:border-ndembo-neon/30 transition-colors"
        >
          <RefreshCw size={14} />
          Réessayer
        </button>
      )}
    </div>
  );
}
