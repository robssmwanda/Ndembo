import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Calendar, Trophy, ChevronRight, Zap } from 'lucide-react';
import { useMatches } from '@/lib/useMatches';
import { useSettings } from '@/lib/settings';
import { MatchCard } from '@/components/MatchCard';
import { MatchList } from '@/components/MatchList';
import { MatchFilters } from '@/components/MatchFilters';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { isToday } from '@/lib/format';
import type { Match } from '@/types';

type FilterKey = 'today' | 'live' | 'upcoming' | 'finished';

export function HomePage() {
  const { settings } = useSettings();
  const { live, upcoming, finished, all, loading, error, isMockData, refresh } = useMatches(true, settings.refreshInterval);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('today');
  const [selectedDate, setSelectedDate] = useState('');

  const competitions = useMemo(() => {
    const map = new Map<string, string>();
    all.forEach(m => map.set(m.competition.id, m.competition.name));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [all]);

  const todaysMatches = useMemo(() => all.filter(m => isToday(m.kickoff)), [all]);

 const filteredLive = useMemo(() => {
  if (activeFilter === 'live') return live;
  if (activeFilter === 'today') return live.filter(m => isToday(m.kickoff));
  return [];
}, [live, activeFilter]);


 const filteredUpcoming = useMemo(() => {
  if (activeFilter === 'upcoming') {
    let result = upcoming;

    if (selectedDate) {
      result = result.filter(m => m.kickoff.startsWith(selectedDate));
    }

    return result;
  }

  if (activeFilter === 'today') {
    let result = upcoming.filter(m => isToday(m.kickoff));

    if (selectedDate) {
      result = result.filter(m => m.kickoff.startsWith(selectedDate));
    }

    return result;
  }

  return [];
}, [upcoming, activeFilter, selectedDate]);

 const filteredFinished = useMemo(() => {
  if (activeFilter === 'finished') {
    let result = finished;

    if (selectedDate) {
      result = result.filter(m => m.kickoff.startsWith(selectedDate));
    }

    return result;
  }

  if (activeFilter === 'today') {
    let result = finished.filter(m => isToday(m.kickoff));

    if (selectedDate) {
      result = result.filter(m => m.kickoff.startsWith(selectedDate));
    }

    return result;
  }

  return [];
}, [finished, activeFilter, selectedDate]);

  const finishedByCompetition = useMemo(() => {
    const groups = new Map<string, { compName: string; matches: Match[] }>();
    filteredFinished.forEach(m => {
      if (!groups.has(m.competition.id)) {
        groups.set(m.competition.id, { compName: m.competition.name, matches: [] });
      }
      groups.get(m.competition.id)!.matches.push(m);
    });
    return Array.from(groups.entries()).map(([id, group]) => ({ id, ...group }));
  }, [filteredFinished]);

  const heroImage = 'https://images.pexels.com/photos/28827841/pexels-photo-28827841.jpeg?auto=compress&cs=tinysrgb&w=1600';

  const tabs = [
    { key: 'today', label: "Aujourd'hui", count: todaysMatches.length },
    { key: 'live', label: 'En direct', count: live.length },
    { key: 'upcoming', label: 'À venir', count: upcoming.length },
    { key: 'finished', label: 'Terminés', count: finished.length },
  ];

  if (loading && all.length === 0) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-64 rounded-2xl" />
        <LoadingSkeleton variant="card" count={6} />
      </div>
    );
  }

  if (error && all.length === 0) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative h-56 lg:h-72 rounded-2xl overflow-hidden border border-ndembo-border">
        <img
          src={heroImage}
          alt="Football stadium"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ndembo-bg via-ndembo-bg/80 to-ndembo-bg/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ndembo-bg via-transparent to-transparent" />

        <div className="relative h-full flex flex-col justify-center px-6 lg:px-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-ndembo-neon/15 border border-ndembo-neon/30 rounded-full px-3 py-1 w-fit mb-3">
            <Radio size={12} className="text-ndembo-neon" />
            <span className="text-[10px] font-bold text-ndembo-neon uppercase tracking-wider">Live Now</span>
          </div>
          <h1 className="text-2xl lg:text-4xl font-bold text-ndembo-text leading-tight mb-2">
            Experience Football in Real Time with <span className="text-ndembo-neon">Ndembo</span>
          </h1>
          <p className="text-sm lg:text-base text-ndembo-muted max-w-lg">
            Live scores, results, standings, and news from the world's biggest competitions.
          </p>

          {/* Dynamic indicators */}
          <div className="flex items-center gap-4 lg:gap-6 mt-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-ndembo-live/15 flex items-center justify-center">
                <Radio size={14} className="text-ndembo-live" />
              </div>
              <div>
                <p className="text-lg font-bold text-ndembo-text leading-none">{live.length}</p>
                <p className="text-[10px] text-ndembo-muted mt-0.5">En direct</p>
              </div>
            </div>
            <div className="w-px h-8 bg-ndembo-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-ndembo-accent/15 flex items-center justify-center">
                <Calendar size={14} className="text-ndembo-accent" />
              </div>
              <div>
                <p className="text-lg font-bold text-ndembo-text leading-none">{todaysMatches.length}</p>
                <p className="text-[10px] text-ndembo-muted mt-0.5">Aujourd'hui</p>
              </div>
            </div>
            <div className="w-px h-8 bg-ndembo-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-ndembo-neon/15 flex items-center justify-center">
                <Trophy size={14} className="text-ndembo-neon" />
              </div>
              <div>
                <p className="text-lg font-bold text-ndembo-text leading-none">{competitions.length}</p>
                <p className="text-[10px] text-ndembo-muted mt-0.5">Compétitions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isMockData && (
        <div className="flex items-center gap-2 bg-ndembo-card border border-ndembo-border rounded-lg px-4 py-2 text-xs text-ndembo-muted">
          <Zap size={12} className="text-ndembo-neon" />
          Mode démo — le backend n'est pas connecté. Les données affichées sont simulées.
        </div>
      )}

      {/* Quick Filters */}
      <MatchFilters
        tabs={tabs}
        activeTab={activeFilter}
        onTabChange={(key) => setActiveFilter(key as FilterKey)}
        date={selectedDate}
        onDateChange={setSelectedDate}
        onRefresh={refresh}
      />

      {/* Live Matches Section */}
      {filteredLive.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-ndembo-live rounded-full animate-pulse-live" />
              <h2 className="text-lg font-bold text-ndembo-text">Live Matches</h2>
              <span className="text-xs text-ndembo-muted">({filteredLive.length})</span>
            </div>
            <Link to="/matches" className="text-xs text-ndembo-neon hover:underline flex items-center gap-0.5">
              Voir tout <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3">
            {filteredLive.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Matches Section */}
      {filteredUpcoming.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-ndembo-text">À Venir</h2>
            <Link to="/matches?tab=upcoming" className="text-xs text-ndembo-neon hover:underline flex items-center gap-0.5">
              Voir tout <ChevronRight size={12} />
            </Link> 
          </div>
          <MatchList matches={filteredUpcoming.slice(0, 8)} showReminder />
        </section>
      )}

      {/* Recent Results Section */}
      {finishedByCompetition.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-ndembo-text mb-3">Résultats Récents</h2>
          <div className="space-y-4">
            {finishedByCompetition.slice(0, 5).map(group => (
              <div key={group.id}>
                <p className="text-xs text-ndembo-muted uppercase tracking-wide mb-2 px-1">{group.compName}</p>
                <MatchList matches={group.matches.slice(0, 5)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {filteredLive.length === 0 && filteredUpcoming.length === 0 && filteredFinished.length === 0 && (
        <EmptyState
          icon={Calendar}
          title="Aucun match trouvé"
          description="Aucun match ne correspond aux filtres sélectionnés pour cette date."
        />
      )}
    </div>
  );
}
