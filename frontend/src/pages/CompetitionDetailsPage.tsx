import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Trophy, BarChart3, Info } from 'lucide-react';
import { useMatches } from '@/lib/useMatches';
import { fetchCompetitionById, fetchStandings } from '@/lib/api';
import { MatchList } from '@/components/MatchList';
import { StandingsTable } from '@/components/StandingsTable';
import { CompetitionBadge } from '@/components/CompetitionBadge';
import { EmptyState } from '@/components/EmptyState';
import type { Competition, Standings } from '@/types';
import LoadingState from '@/components/LoadingState';

type TabKey = 'overview' | 'fixtures' | 'results' | 'standings';

export function CompetitionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { all, loading, isMockData } = useMatches(false);

  const [competition, setCompetition] = useState<Competition | undefined>(undefined);
  const [competitionLoading, setCompetitionLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [standings, setStandings] = useState<Standings | undefined>(undefined);
  const [standingsLoading, setStandingsLoading] = useState(true);

  const compMatches = useMemo(() => all.filter(m => m.competition.id === id), [all, id]);

  const liveMatches = compMatches.filter(m => m.status === 'live');
  const upcomingMatches = compMatches.filter(m => m.status === 'upcoming');
  const finishedMatches = compMatches.filter(m => m.status === 'finished');

  useEffect(() => {
  if (!id) return;

  const controller = new AbortController();

  async function loadCompetition() {
    setCompetitionLoading(true);

    const result = await fetchCompetitionById( id, controller.signal );

    setCompetition(result.data ?? undefined);
    setCompetitionLoading(false);
  }

  loadCompetition();

  return () => controller.abort();
}, [id]);


  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    async function load() {
      setStandingsLoading(true);
      const result = await fetchStandings(id!, new Date().getFullYear(),controller.signal );
      setStandings(result.data ?? undefined);
      setStandingsLoading(false);
    }
    load();
    return () => controller.abort();
  }, [id]);

  if (competitionLoading ||(loading && all.length === 0)) {
      return  <LoadingState />

  }

  if (!competition) {
    return (
      <div className="space-y-4">
        <Link to="/competitions" className="inline-flex items-center gap-1.5 text-sm text-ndembo-muted hover:text-ndembo-neon">
          <ArrowLeft size={14} /> Retour aux compétitions
        </Link>
        <EmptyState
          icon={Info}
          title="Compétition introuvable"
          description="Cette compétition n'existe pas ou n'est pas disponible dans les données actuelles."
        />
      </div>
    );
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'overview', label: "Vue d'ensemble" },
    { key: 'fixtures', label: 'Matchs à venir' },
    { key: 'results', label: 'Résultats' },
    { key: 'standings', label: 'Classement' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <Link to="/competitions" className="inline-flex items-center gap-1.5 text-sm text-ndembo-muted hover:text-ndembo-neon transition-colors">
        <ArrowLeft size={14} /> Retour aux compétitions
      </Link>

      {/* Header */}
      <div className="bg-ndembo-card border border-ndembo-border rounded-2xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-ndembo-border/30 flex items-center justify-center text-xl font-bold text-ndembo-neon">
          {competition.name.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-ndembo-text">{competition.name}</h1>
          <p className="text-sm text-ndembo-muted">{competition.country} · {competition.region}</p>
        </div>
        {isMockData && (
          <span className="text-xs text-ndembo-muted bg-ndembo-bg border border-ndembo-border rounded-lg px-3 py-1">Démo</span>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-ndembo-card border border-ndembo-border rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-ndembo-live/15 flex items-center justify-center"><Calendar size={14} className="text-ndembo-live" /></div>
          <div><p className="text-lg font-bold text-ndembo-text">{liveMatches.length}</p><p className="text-[10px] text-ndembo-muted">En direct</p></div>
        </div>
        <div className="bg-ndembo-card border border-ndembo-border rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-ndembo-accent/15 flex items-center justify-center"><Calendar size={14} className="text-ndembo-accent" /></div>
          <div><p className="text-lg font-bold text-ndembo-text">{upcomingMatches.length}</p><p className="text-[10px] text-ndembo-muted">À venir</p></div>
        </div>
        <div className="bg-ndembo-card border border-ndembo-border rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-ndembo-neon/15 flex items-center justify-center"><Trophy size={14} className="text-ndembo-neon" /></div>
          <div><p className="text-lg font-bold text-ndembo-text">{finishedMatches.length}</p><p className="text-[10px] text-ndembo-muted">Terminés</p></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-ndembo-card border border-ndembo-border rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
              activeTab === tab.key ? 'bg-ndembo-neon text-ndembo-bg' : 'text-ndembo-muted hover:text-ndembo-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {liveMatches.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-ndembo-text mb-2">En direct</h3>
                <MatchList matches={liveMatches} />
              </section>
            )}
            {upcomingMatches.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-ndembo-text mb-2">À venir</h3>
                <MatchList matches={upcomingMatches.slice(0, 10)} showReminder />
              </section>
            )}
            {finishedMatches.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-ndembo-text mb-2">Résultats récents</h3>
                <MatchList matches={finishedMatches.slice(0, 10)} />
              </section>
            )}
            {compMatches.length === 0 && (
              <EmptyState icon={Info} title="Aucun match disponible" description="Aucun match n'est disponible pour cette compétition dans les données actuelles." />
            )}
          </div>
        )}

        {activeTab === 'fixtures' && (
          upcomingMatches.length > 0 ? (
            <MatchList matches={upcomingMatches} showReminder />
          ) : (
            <EmptyState icon={Calendar} title="Aucun match à venir" description="Aucun match programmé pour cette compétition." />
          )
        )}

        {activeTab === 'results' && (
          finishedMatches.length > 0 ? (
            <MatchList matches={finishedMatches} />
          ) : (
            <EmptyState icon={Trophy} title="Aucun résultat" description="Aucun match terminé pour cette compétition." />
          )
        )}

        {activeTab === 'standings' && (
          standingsLoading ? (
            <LoadingSkeleton variant="table" count={10} />
          ) : standings && standings.table.length > 0 ? (
            <div className="space-y-3">
              {standings.season && <p className="text-xs text-ndembo-muted">Saison {standings.season}</p>}
              <StandingsTable rows={standings.table} />
            </div>
          ) : (
            <EmptyState icon={BarChart3} title="Classement indisponible" description="Le classement de cette compétition n'est pas actuellement fourni par le backend." />
          )
        )}
      </div>
    </div>
  );
}
