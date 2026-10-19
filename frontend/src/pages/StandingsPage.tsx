import { useState, useMemo, useEffect } from 'react';
import { BarChart3, Trophy } from 'lucide-react';
import { useMatches } from '@/lib/useMatches';
import { fetchStandings } from '@/lib/api';
import { StandingsTable } from '@/components/StandingsTable';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { CompetitionBadge } from '@/components/CompetitionBadge';
import type { Standings } from '@/types';

export function StandingsPage() {
  const { all, loading, error, isMockData, refresh } = useMatches(false);
  const [selectedComp, setSelectedComp] = useState('');
  const [standings, setStandings] = useState<Standings | undefined>(undefined);
  const [standingsLoading, setStandingsLoading] = useState(true);

  const competitions = useMemo(() => {
    const map = new Map<string, string>();
    all.forEach(m => map.set(m.competition.id, m.competition.name));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [all]);

  useEffect(() => {
    if (competitions.length === 0) return;
    const compId = selectedComp || competitions[0].id;
    const controller = new AbortController();
    async function load() {
      setStandingsLoading(true);
      const result = await fetchStandings(compId, controller.signal);
      setStandings(result.data ?? undefined);
      setStandingsLoading(false);
    }
    load();
    return () => controller.abort();
  }, [selectedComp, competitions]);

  if (loading && all.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-ndembo-text">Classements</h1>
        <LoadingSkeleton variant="table" count={10} />
      </div>
    );
  }

  if (error && all.length === 0) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ndembo-text">Classements</h1>
        {isMockData && (
          <span className="text-xs text-ndembo-muted bg-ndembo-card border border-ndembo-border rounded-lg px-3 py-1">
            Mode démo
          </span>
        )}
      </div>

      {/* Competition selector */}
      <div className="flex items-center gap-2 flex-wrap">
        {competitions.map(comp => (
          <button
            key={comp.id}
            onClick={() => setSelectedComp(comp.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              (selectedComp || competitions[0]?.id) === comp.id
                ? 'bg-ndembo-neon text-ndembo-bg'
                : 'bg-ndembo-card border border-ndembo-border text-ndembo-muted hover:text-ndembo-text'
            }`}
          >
            {comp.name}
          </button>
        ))}
      </div>

      {standingsLoading ? (
        <LoadingSkeleton variant="table" count={10} />
      ) : standings && standings.table.length > 0 ? (
        <div className="space-y-3">
          {standings.season && (
            <div className="flex items-center justify-between">
              <CompetitionBadge name={standings.competition.name} country={standings.competition.country} size="md" />
              <span className="text-xs text-ndembo-muted">Saison {standings.season}</span>
            </div>
          )}
          <StandingsTable rows={standings.table} />
        </div>
      ) : (
        <EmptyState
          icon={Trophy}
          title="Classement indisponible"
          description="Le classement de cette compétition n'est pas actuellement fourni par le backend. Les composants sont prêts pour une future intégration API."
        />
      )}
    </div>
  );
}
