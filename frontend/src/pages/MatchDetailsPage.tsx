import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Goal, Square, Repeat, Info } from 'lucide-react';
import { fetchMatchById } from '@/lib/api';
import { TeamLogo } from '@/components/TeamLogo';
import { CompetitionBadge } from '@/components/CompetitionBadge';
import { LiveIndicator } from '@/components/LiveIndicator';
import { FavoriteButton } from '@/components/FavoriteButton';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { StandingsTable } from '@/components/StandingsTable';
import { fetchStandings } from '@/lib/api';
import { formatDateLong, formatTime, statusLabel } from '@/lib/format';
import type { Match, Standings, StatItem } from '@/types';
import LoadingState from '@/components/LoadingState';

type TabKey = 'overview' | 'statistics' | 'lineups' | 'standings';

export function MatchDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | undefined | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [standings, setStandings] = useState<Standings | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

      useEffect(() => {
      const controller = new AbortController();
      let cancelled = false;

      async function load() {
        setLoading(true);
        setError(null);

        try {
          const result = await fetchMatchById(id!, controller.signal);

          // La requête n'est plus active
          if (cancelled) return;

          console.log("🧩 RESULT MATCH DETAILS :", result);

          if (!result.data) {
            setMatch(null);
            setError("Failed to load match details");
            return;
          }

          setMatch(result.data);

          if (result.data.competition) {
            console.log(
              "🏆 CHARGEMENT STANDINGS →",
              result.data.competition.id
            );

            const standingsResult = await fetchStandings(
              result.data.competition.id,
              result.data.competition.season,
              controller.signal
            );

            if (!cancelled) {
              setStandings(standingsResult.data ?? undefined);
            }
          }
        } catch (err) {
          if (
            err instanceof DOMException &&
            err.name === "AbortError"
          ) {
            return;
          }

          if (!cancelled) {
            console.error("❌ MATCH DETAILS ERROR :", err);
            setError("Failed to load match details");
          }
        } finally {
          // Très important :
          // une ancienne requête annulée ne doit pas modifier loading
          if (!cancelled) {
            setLoading(false);
          }
        }
      }

      load();

      return () => {
        cancelled = true;
        controller.abort();
      };
    }, [id, refreshKey]);

      if (loading) {
        return <LoadingState />;
      }

  if (error) {
    return <ErrorState message={error} onRetry={() => setRefreshKey(k => k + 1)} />;
  }

  if (!match) {
    return (
      <EmptyState
        icon={Info}
        title="Match introuvable"
        description="Ce match n'existe pas ou n'est plus disponible. Retournez à la liste des matchs."
      />
    );
  }

  const isLive = match.status === 'live';
  const hasScore = match.homeScore !== null && match.awayScore !== null;

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'statistics', label: 'Statistics' },
    { key: 'lineups', label: 'Lineups' },
    { key: 'standings', label: 'Standings' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <Link to="/matches" className="inline-flex items-center gap-1.5 text-sm text-ndembo-muted hover:text-ndembo-neon transition-colors">
        <ArrowLeft size={14} /> Retour aux matchs
      </Link>

      {/* Match Header */}
      <div className="bg-ndembo-card border border-ndembo-border rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-ndembo-neon/5 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center justify-between mb-5">
            <CompetitionBadge name={match.competition.name} country={match.competition.country} size="md" />
            {isLive ? (
              <LiveIndicator minute={match.minute} />
            ) : (
              <span className="text-xs text-ndembo-muted uppercase tracking-wide">{statusLabel(match.status)}</span>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-6 lg:gap-12">
            {/* Home team */}
            <div className="flex flex-col items-center justify-start gap-2 sm:gap-3 flex-1 min-w-0 max-w-[130px] sm:max-w-[200px]">
              <TeamLogo
                name={match.homeTeam.name}
                shortName={match.homeTeam.shortName}
                logo={match.homeTeam.logo}
                size="lg"
              />
              {/* Nom court sur mobile, nom complet sur écran plus large */}
              <span className="sm:hidden text-xs font-semibold text-ndembo-text text-center leading-tight break-words">
                {match.homeTeam.shortName || match.homeTeam.name}
              </span>
              <span className="hidden sm:block text-sm lg:text-base font-semibold text-ndembo-text text-center leading-tight break-words">
                {match.homeTeam.name}
              </span>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              {hasScore ? (
                <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4">
                  <span className="text-2xl sm:text-3xl lg:text-5xl font-bold font-mono text-ndembo-text tabular-nums">{match.homeScore}</span>
                  <span className="text-xl sm:text-2xl lg:text-3xl text-ndembo-dim">-</span>
                  <span className="text-2xl sm:text-3xl lg:text-5xl font-bold font-mono text-ndembo-text tabular-nums">{match.awayScore}</span>
                </div>
              ) : (
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono text-ndembo-muted">VS</div>
              )}
              {isLive && match.minute && (
                <span className="text-xs text-ndembo-live font-bold mt-1">{match.minute}</span>
              )}
              <span className="text-[10px] sm:text-xs text-ndembo-muted mt-1 text-center whitespace-nowrap">
                {formatTime(match.kickoff)} · {formatDateLong(match.kickoff)}
              </span>
            </div>

            {/* Away team */}
            <div className="flex flex-col items-center justify-start gap-2 sm:gap-3 flex-1 min-w-0 max-w-[130px] sm:max-w-[200px]">
              <TeamLogo
                name={match.awayTeam.name}
                shortName={match.awayTeam.shortName}
                logo={match.awayTeam.logo}
                size="lg"
              />
              <span className="sm:hidden text-xs font-semibold text-ndembo-text text-center leading-tight break-words">
                {match.awayTeam.shortName || match.awayTeam.name}
              </span>
              <span className="hidden sm:block text-sm lg:text-base font-semibold text-ndembo-text text-center leading-tight break-words">
                {match.awayTeam.name}
              </span>
            </div>
          </div>
          
          <MatchCountdown
            kickoff={match.kickoff}
            status={match.status}
          />
          <div className="flex items-center justify-center mt-5">
            <FavoriteButton
              id={match.id}
              type="match"
              name={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
              sublabel={match.competition.name}
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-ndembo-card border border-ndembo-border rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-ndembo-neon text-ndembo-bg'
                : 'text-ndembo-muted hover:text-ndembo-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-ndembo-card border border-ndembo-border rounded-2xl p-5">
        {activeTab === 'overview' && <OverviewTab match={match} />}
        {activeTab === 'statistics' && <StatisticsTab match={match} />}
        {activeTab === 'lineups' && <LineupsTab match={match} />}
        {activeTab === 'standings' && <StandingsTab standings={standings} />}
      </div>
    </div>
  );
}



function MatchCountdown({
  kickoff,
  status,
}: {
  kickoff: Match['kickoff'];
  status: Match['status'];
}) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (status !== 'upcoming') return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [status]);

  const kickoffDate = new Date(kickoff);

  if (Number.isNaN(kickoffDate.getTime())) return null;

  const today = new Date(now);

  const isToday =
    kickoffDate.getFullYear() === today.getFullYear() &&
    kickoffDate.getMonth() === today.getMonth() &&
    kickoffDate.getDate() === today.getDate();

  if (!isToday || status !== 'upcoming') return null;

  const remaining = Math.max(0, kickoffDate.getTime() - now);

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  const pad = (value: number) => String(value).padStart(2, '0');

  return (
    <div className="mt-6 rounded-xl border border-ndembo-neon/20 bg-ndembo-neon/5 p-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-ndembo-muted mb-3">
        COUP D'ENVOI DANS
      </p>

      <div className="flex items-center justify-center gap-3">
        {[hours, minutes, seconds].map((value, index) => (
          <div key={index} className="flex flex-col items-center">
            <span className="text-3xl lg:text-4xl font-bold font-mono tabular-nums text-ndembo-neon">
              {pad(value)}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-ndembo-muted mt-1">
              {['Heures', 'Minutes', 'Secondes'][index]}
            </span>
          </div>
        ))}
      </div>

      {remaining === 0 && (
        <p className="text-xs text-ndembo-neon mt-3 font-semibold">
          COUP D'ENVOI IMMINENT
        </p>
      )}
    </div>
  );
}


function OverviewTab({ match }: { match: Match }) {
  if (!match.events || match.events.length === 0) {
    if (match.status === 'upcoming') {
      return (
        <EmptyState
          icon={Info}
          title="Match à venir"
          description={`Ce match débutera le ${formatDateLong(match.kickoff)} à ${formatTime(match.kickoff)}. Les événements seront disponibles une fois le match commencé.`}
        />
      );
    }
    return (
      <EmptyState
        icon={Info}
        title="Données d'événements indisponibles"
        description="Les événements du match (buts, cartons, changements) ne sont pas actuellement fournis par le backend. Les composants sont prêts pour une future intégration API."
      />
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-ndembo-text mb-3">Chronologie des événements</h3>
      <div className="relative">
        {match.events.map((event, idx) => (
          <div key={event.id} className="flex items-start gap-3 group">
            {/* Left/right alignment */}
            <div className={`flex items-center gap-2 flex-1 ${event.team === 'home' ? 'justify-end' : 'flex-row-reverse'}`}>
              {event.team === 'home' && (
                <>
                  <span className="text-xs text-ndembo-text">{event.player}</span>
                  <EventIcon type={event.type} />
                </>
              )}
              {event.team === 'away' && (
                <>
                  <EventIcon type={event.type} />
                  <span className="text-xs text-ndembo-text">{event.player}</span>
                </>
              )}
            </div>
            {/* Center minute */}
            <div className="flex flex-col items-center w-12 flex-shrink-0">
              <span className="text-xs font-mono text-ndembo-muted bg-ndembo-bg rounded-full px-2 py-0.5 border border-ndembo-border">{event.minute}</span>
              {idx < match.events!.length - 1 && <div className="w-px h-full bg-ndembo-border mt-1" />}
            </div>
            <div className="flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EventIcon({ type }: { type: string }) {
    if (type === 'goal') { return <span className="text-sm"> ⚽️ But</span>;}
  if (type === 'yellow_card') return <Square size={12} className="text-yellow-400 fill-yellow-400" />;
  if (type === 'red_card') return <Square size={12} className="text-ndembo-live fill-ndembo-live" />;
  if (type === 'substitution') return <Repeat size={14} className="text-ndembo-accent" />;
  return null;
}

function StatisticsTab({ match }: { match: Match }) {
    function translateStatisticLabel(label: string) {
        const translations: Record<string, string> = {
          "goals_prevented": "Buts évités",
          "Shots on Goal": "Tirs cadrés",
          "Shots off Goal": "Tirs non cadrés",
          "Total Shots": "Tirs totaux",
          "Blocked Shots": "Tirs bloqués",
          "Shots insidebox": "Tirs dans la surface",
          "Shots outsidebox": "Tirs hors de la surface",
          "Fouls": "Fautes",
          "Corner Kicks": "Corners",
          "Offsides": "Hors-jeu",
          "Ball Possession": "Possession du ballon",
          "Yellow Cards": "Cartons jaunes",
          "Red Cards": "Cartons rouges",
          "Goalkeeper Saves": "Arrêts du gardien",
          "Total passes": "Passes totales",
          "Passes accurate": "Passes réussies",
          "Passes %": "Précision des passes",
          "expected_goals": "Buts attendus",
        };

        return translations[label] ?? label;
      }
  if (!match.statistics || match.statistics.items.length === 0) {
    return (
      <EmptyState
        icon={Info}
        title="Statistiques indisponibles"
        description="Les statististiques détaillées du match ne sont pas actuellement fournies par le backend. Les composants sont prêts pour une future intégration API."
      />
    );
  }

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-ndembo-text">Statistiques du Match</h3>
      <div className="space-y-4">
        {match.statistics.items.map((stat: StatItem, idx) => {
          const homeVal = typeof stat.home === 'string' ? parseInt(stat.home) : stat.home;
          const awayVal = typeof stat.away === 'string' ? parseInt(stat.away) : stat.away;
          console.log("📊 STAT LABEL :", stat.label);
          const total = (homeVal || 0) + (awayVal || 0) || 1;
          const homePct = ((homeVal || 0) / total) * 100;
          const awayPct = 100 - homePct;

          return (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-mono font-bold text-ndembo-text tabular-nums">{stat.home}</span>
                <span className="text-xs text-ndembo-muted uppercase tracking-wide">{translateStatisticLabel(stat.label)}</span>
                <span className="text-sm font-mono font-bold text-ndembo-text tabular-nums">{stat.away}</span>
              </div>
              <div className="flex items-center gap-1 h-2 rounded-full overflow-hidden bg-ndembo-border/30">
                <div className="h-full bg-ndembo-neon transition-all duration-500" style={{ width: `${homePct}%` }} />
                <div className="h-full bg-ndembo-accent/60 transition-all duration-500" style={{ width: `${awayPct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LineupsTab({ match }: { match: Match }) {
  if (!match.lineups) {
    return (
      <EmptyState
        icon={Info}
        title="Compositions indisponibles"
        description="Les compositions d'équipes ne sont pas actuellement fournies par le backend. Les composants sont prêts pour une future intégration API."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {['home', 'away'].map(side => {
        const lineup = side === 'home' ? match.lineups!.home : match.lineups!.away;
        const team = side === 'home' ? match.homeTeam : match.awayTeam;
        return (
          <div key={side}>
            <div className="flex items-center gap-2 mb-3">
              <TeamLogo
                name={team.name}
                shortName={team.shortName}
                logo={team.logo}
                size="lg"
              />
              <span className="text-sm font-semibold text-ndembo-text">{team.name}</span>
              <span className="text-xs text-ndembo-muted ml-auto">{lineup.formation}</span>
            </div>
            <div className="space-y-1.5">
              {lineup.players.map(p => (
                <div key={p.number} className="flex items-center gap-3 py-1.5 px-2 hover:bg-ndembo-bg/30 rounded-lg transition-colors">
                  <span className="text-xs font-mono font-bold text-ndembo-muted w-6">{p.number}</span>
                  <span className="text-sm text-ndembo-text flex-1">{p.name}</span>
                  <span className="text-[10px] text-ndembo-dim">{p.position}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StandingsTab({ standings }: { standings?: Standings }) {
  if (!standings || standings.table.length === 0) {
    return (
      <EmptyState
        icon={Info}
        title="Classement indisponible"
        description="Le classement de cette compétition n'est pas actuellement fourni par le backend."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ndembo-text">{standings.competition.name}</h3>
        {standings.season && <span className="text-xs text-ndembo-muted">Saison {standings.season}</span>}
      </div>
      <StandingsTable rows={standings.table} />
    </div>
  );
}
