import { useMemo } from 'react';
import { BarChart3, TrendingUp, Target, Shield } from 'lucide-react';
import { useMatches } from '@/lib/useMatches';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { TeamLogo } from '@/components/TeamLogo';
import type { Match } from '@/types';

export function StatisticsPage() {
  const { all, loading, error, isMockData, refresh } = useMatches(false);

  const stats = useMemo(() => {
    const finished = all.filter(m => m.status === 'finished' && m.homeScore !== null && m.awayScore !== null);
    const totalGoals = finished.reduce((sum, m) => sum + (m.homeScore! + m.awayScore!), 0);
    const avgGoals = finished.length > 0 ? (totalGoals / finished.length).toFixed(1) : '0';
    const homeWins = finished.filter(m => m.homeScore! > m.awayScore!).length;
    const awayWins = finished.filter(m => m.awayScore! > m.homeScore!).length;
    const draws = finished.filter(m => m.homeScore === m.awayScore).length;
    const homeWinPct = finished.length > 0 ? Math.round((homeWins / finished.length) * 100) : 0;
    const awayWinPct = finished.length > 0 ? Math.round((awayWins / finished.length) * 100) : 0;
    const drawPct = finished.length > 0 ? 100 - homeWinPct - awayWinPct : 0;

    // Top scoring teams
    const teamGoals = new Map<string, { name: string; goals: number; shortName?: string }>();
    finished.forEach(m => {
      if (!teamGoals.has(m.homeTeam.id)) teamGoals.set(m.homeTeam.id, { name: m.homeTeam.name, goals: 0, shortName: m.homeTeam.shortName });
      if (!teamGoals.has(m.awayTeam.id)) teamGoals.set(m.awayTeam.id, { name: m.awayTeam.name, goals: 0, shortName: m.awayTeam.shortName });
      teamGoals.get(m.homeTeam.id)!.goals += m.homeScore!;
      teamGoals.get(m.awayTeam.id)!.goals += m.awayScore!;
    });
    const topScorers = Array.from(teamGoals.values()).sort((a, b) => b.goals - a.goals).slice(0, 10);

    return { totalMatches: finished.length, totalGoals, avgGoals, homeWins, awayWins, draws, homeWinPct, awayWinPct, drawPct, topScorers };
  }, [all]);

  if (loading && all.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-ndembo-text">Statistiques</h1>
        <LoadingSkeleton variant="card" count={4} />
      </div>
    );
  }

  if (error && all.length === 0) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  if (all.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-ndembo-text">Statistiques</h1>
        <EmptyState
          icon={BarChart3}
          title="Statistiques indisponibles"
          description="Les données nécessaires aux statististiques ne sont pas actuellement disponibles. Cette page est prête pour une future intégration API."
        />
      </div>
    );
  }

  const cards = [
    { label: 'Matchs terminés', value: stats.totalMatches, icon: BarChart3, color: 'text-ndembo-neon', bg: 'bg-ndembo-neon/15' },
    { label: 'Buts totaux', value: stats.totalGoals, icon: Target, color: 'text-ndembo-accent', bg: 'bg-ndembo-accent/15' },
    { label: 'Buts/match', value: stats.avgGoals, icon: TrendingUp, color: 'text-ndembo-neon', bg: 'bg-ndembo-neon/15' },
    { label: 'Victoires domicile', value: `${stats.homeWinPct}%`, icon: Shield, color: 'text-ndembo-accent', bg: 'bg-ndembo-accent/15' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ndembo-text">Statistiques</h1>
        {isMockData && (
          <span className="text-xs text-ndembo-muted bg-ndembo-card border border-ndembo-border rounded-lg px-3 py-1">Mode démo</span>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-ndembo-card border border-ndembo-border rounded-xl p-4">
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                <Icon size={16} className={card.color} />
              </div>
              <p className="text-2xl font-bold text-ndembo-text leading-none">{card.value}</p>
              <p className="text-xs text-ndembo-muted mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Win distribution chart */}
      <div className="bg-ndembo-card border border-ndembo-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-ndembo-text mb-4">Répartition des résultats</h3>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-ndembo-muted">Victoires domicile</span>
              <span className="text-xs font-mono text-ndembo-text">{stats.homeWins} ({stats.homeWinPct}%)</span>
            </div>
            <div className="h-3 rounded-full bg-ndembo-border/30 overflow-hidden">
              <div className="h-full bg-ndembo-neon rounded-full transition-all duration-500" style={{ width: `${stats.homeWinPct}%` }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-ndembo-muted">Matchs nuls</span>
              <span className="text-xs font-mono text-ndembo-text">{stats.draws} ({stats.drawPct}%)</span>
            </div>
            <div className="h-3 rounded-full bg-ndembo-border/30 overflow-hidden">
              <div className="h-full bg-ndembo-muted rounded-full transition-all duration-500" style={{ width: `${stats.drawPct}%` }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-ndembo-muted">Victoires extérieur</span>
              <span className="text-xs font-mono text-ndembo-text">{stats.awayWins} ({stats.awayWinPct}%)</span>
            </div>
            <div className="h-3 rounded-full bg-ndembo-border/30 overflow-hidden">
              <div className="h-full bg-ndembo-accent rounded-full transition-all duration-500" style={{ width: `${stats.awayWinPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Top scoring teams */}
      <div className="bg-ndembo-card border border-ndembo-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-ndembo-text mb-4">Équipes les plus prolifiques</h3>
        <div className="space-y-2">
          {stats.topScorers.map((team, idx) => {
            const maxGoals = stats.topScorers[0]?.goals || 1;
            const pct = (team.goals / maxGoals) * 100;
            return (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs font-mono text-ndembo-dim w-5 text-right">{idx + 1}</span>
                <TeamLogo name={team.name} shortName={team.shortName} size="sm" />
                <span className="text-sm text-ndembo-text flex-1 truncate hidden sm:inline">{team.name}</span>
                <span className="text-sm text-ndembo-text flex-1 truncate sm:hidden">{team.shortName}</span>
                <div className="w-24 h-2 rounded-full bg-ndembo-border/30 overflow-hidden hidden sm:block">
                  <div className="h-full bg-ndembo-neon rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm font-mono font-bold text-ndembo-text w-8 text-right">{team.goals}</span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-ndembo-muted">
        Ces statistiques sont calculées à partir des matchs terminés disponibles dans les données actuelles.
        Des statistiques détaillées par joueur et par compétition nécessiteraient un endpoint API dédié.
      </p>
    </div>
  );
}
