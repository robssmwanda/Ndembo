import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Info, Trophy, Calendar, TrendingUp, Target, Shield } from 'lucide-react';
import { fetchTeamFixtures, fetchTeamInfo, type TeamFixturesResponse } from '@/lib/api';
import { TeamLogo } from '@/components/TeamLogo';
import { CompetitionBadge } from '@/components/CompetitionBadge';
import { LiveIndicator } from '@/components/LiveIndicator';
import { FavoriteButton } from '@/components/FavoriteButton';
import { MatchList } from '@/components/MatchList';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import { formatTime, formatDateLong, statusLabel } from '@/lib/format';
import type { Match } from '@/types';

type TabKey = 'overview' | 'fixtures' | 'results';

export function TeamDetailsPage() { 
  const { id } = useParams<{ id: string }>();
  const [teamInfo, setTeamInfo] = useState<TeamFixturesResponse['team'] | null>(null);
  const [searchParams] = useSearchParams();

const seasonParam = Number(searchParams.get('season'));
const selectedSeason = Number.isInteger(seasonParam) && seasonParam >= 2000
    ? seasonParam
    : new Date().getFullYear();

  const [data, setData] = useState<TeamFixturesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedTeamId, setLoadedTeamId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
       const result = await fetchTeamFixtures(id!, selectedSeason, 'all', controller.signal);
        if (result.error) {
          setError(result.error);
        } else {
          setData(result.data);
        }
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          setError('Impossible de charger les données de l\'équipe. Vérifiez que le backend est accessible.');
        }
      } finally {
         if (!controller.signal.aborted) {
            setLoadedTeamId(id!);
            setLoading(false);
          }
      }
    }
    load();
    return () => controller.abort();
  }, [id, selectedSeason, refreshKey]);

  useEffect(() => {
  if (!id) return;

  const controller = new AbortController();

  async function loadTeamInfo() {
    const result = await fetchTeamInfo(id!, controller.signal);

    if (result.data) {
      setTeamInfo(result.data);
    }
  }

  loadTeamInfo().catch((err) => {
    if (!(err instanceof DOMException && err.name === 'AbortError')) {
      console.error(
        'Erreur lors du chargement des informations du club :',
        err
      );
    }
  });

  return () => controller.abort();
}, [id]);

  const upcoming = useMemo(
    () => data?.fixtures.filter(m => m.status === 'upcoming').sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()) ?? [],
    [data],
  );
  const finished = useMemo(
    () => data?.fixtures.filter(m => m.status === 'finished').sort((a, b) => new Date(b.kickoff).getTime() - new Date(a.kickoff).getTime()) ?? [],
    [data],
  );
  const live = useMemo(
    () => data?.fixtures.filter(m => m.status === 'live') ?? [],
    [data],
  );

  const stats = useMemo(() => {
    const finishedMatches = finished;
    const wins = finishedMatches.filter(m => {
      const isHome = m.homeTeam.id === id;
      return isHome ? (m.homeScore ?? 0) > (m.awayScore ?? 0) : (m.awayScore ?? 0) > (m.homeScore ?? 0);
    }).length;
    const draws = finishedMatches.filter(m => m.homeScore === m.awayScore).length;
    const losses = finishedMatches.length - wins - draws;
    const goalsFor = finishedMatches.reduce((sum, m) => {
      const isHome = m.homeTeam.id === id;
      return sum + (isHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0));
    }, 0);
    const goalsAgainst = finishedMatches.reduce((sum, m) => {
      const isHome = m.homeTeam.id === id;
      return sum + (isHome ? (m.awayScore ?? 0) : (m.homeScore ?? 0));
    }, 0);

    return { played: finishedMatches.length, wins, draws, losses, goalsFor, goalsAgainst };
  }, [finished, id]);

      if (loading || loadedTeamId !== id) {
        return <LoadingState />;
      }

  if (error) {
    return <ErrorState message={error} onRetry={() => setRefreshKey(k => k + 1)} />;
  }

  if (!data || !data.team) {
    return (
      <EmptyState
        icon={Info}
        title="Équipe introuvable"
        description="Cette équipe n'existe pas ou n'est pas disponible. Retournez à la liste des matchs."
      />
    );
  }

  const team = data.team;
  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'overview', label: 'Vue d\'ensemble' },
    { key: 'fixtures', label: 'À venir', count: upcoming.length },
    { key: 'results', label: 'Résultats', count: finished.length },
  ];

  const statCards = [
    { label: 'Matchs joués', value: stats.played, icon: Calendar, color: 'text-ndembo-neon', bg: 'bg-ndembo-neon/15' },
    { label: 'Victoires', value: stats.wins, icon: TrendingUp, color: 'text-ndembo-neon', bg: 'bg-ndembo-neon/15' },
    { label: 'Nuls', value: stats.draws, icon: Shield, color: 'text-ndembo-muted', bg: 'bg-ndembo-muted/15' },
    { label: 'Défaites', value: stats.losses, icon: Shield, color: 'text-ndembo-live', bg: 'bg-ndembo-live/15' },
    { label: 'Buts marqués', value: stats.goalsFor, icon: Target, color: 'text-ndembo-accent', bg: 'bg-ndembo-accent/15' },
    { label: 'Buts encaissés', value: stats.goalsAgainst, icon: Target, color: 'text-ndembo-live', bg: 'bg-ndembo-live/15' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <Link to="/matches" className="inline-flex items-center gap-1.5 text-sm text-ndembo-muted hover:text-ndembo-neon transition-colors">
        <ArrowLeft size={14} /> Retour aux matchs
      </Link>

      {/* Team Header */}
      <div className="bg-ndembo-card border border-ndembo-border rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-ndembo-neon/5 rounded-full blur-3xl" />

        <div className="relative flex flex-col sm:flex-row items-center gap-5">
          <TeamLogo name={team.name} shortName={team.shortName} logo={team.logo} size="lg" />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl lg:text-2xl font-bold text-ndembo-text leading-tight">{team.name}</h1>
            <p className="text-sm text-ndembo-muted mt-1"> {[teamInfo?.country, teamInfo?.city].filter(Boolean).join(' · ') || `Équipe #${team.id}`}</p>
          </div>
          <FavoriteButton
            id={team.id}
            type="team"
            name={team.name}
            size="md"
          />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-ndembo-card border border-ndembo-border rounded-xl p-4">
              <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mb-2`}>
                <Icon size={14} className={card.color} />
              </div>
              <p className="text-xl font-bold text-ndembo-text leading-none">{card.value}</p>
              <p className="text-[10px] text-ndembo-muted mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-ndembo-card border border-ndembo-border rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === tab.key
                ? 'bg-ndembo-neon text-ndembo-bg'
                : 'text-ndembo-muted hover:text-ndembo-text'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1 rounded ${activeTab === tab.key ? 'bg-ndembo-bg/20' : 'bg-ndembo-border/50'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {live.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-ndembo-live rounded-full animate-pulse-live" />
                  <h3 className="text-sm font-semibold text-ndembo-text">En direct</h3>
                </div>
                <MatchList matches={live} />
              </section>
            )}

            {upcoming.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-ndembo-text mb-2">Prochains matchs</h3>
                <MatchList matches={upcoming.slice(0, 5)} showReminder />
              </section>
            )}

            {finished.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-ndembo-text mb-2">Résultats récents</h3>
                <MatchList matches={finished.slice(0, 5)} />
              </section>
            )}

            {data.fixtures.length === 0 && (
              <EmptyState
                icon={Info}
                title="Aucun match disponible"
                description="Aucun match n'est disponible pour cette équipe dans les données actuelles."
              />
            )}
          </div>
        )}

        {activeTab === 'fixtures' && (
          upcoming.length > 0 ? (
            <MatchList matches={upcoming} showReminder />
          ) : (
            <EmptyState icon={Calendar} title="Aucun match à venir" description="Aucun match programmé pour cette équipe." />
          )
        )}

        {activeTab === 'results' && (
          finished.length > 0 ? (
            <MatchList matches={finished} />
          ) : (
            <EmptyState icon={Trophy} title="Aucun résultat" description="Aucun match terminé pour cette équipe." />
          )
        )}
      </div>
    </div>
  );
}



export default TeamDetailsPage;