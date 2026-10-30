
import { useState, useMemo } from 'react';
import { fetchMatchesByDate } from '@/lib/api';
import { useSearchParams } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { useMatches } from '@/lib/useMatches';
import { useSettings } from '@/lib/settings';
import { MatchCard } from '@/components/MatchCard';
import { MatchList } from '@/components/MatchList';
import { MatchFilters } from '@/components/MatchFilters';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import type { Match, MatchStatus } from '@/types';

type TabKey = 'live' | 'upcoming' | 'finished';

export function MatchesPage() {
   
  const now = new Date();

  const localDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

    const addDays = (date: Date, days: number) => {
    const result = new Date(date);    
    result.setDate(result.getDate() + days);
    return result;
  };

  const todayKey = localDateKey(now);
  const tomorrowKey = localDateKey(addDays(now, 1));
  const dayAfterTomorrowKey = localDateKey(addDays(now, 2));
  const [selectedDate, setSelectedDate] = useState(todayKey);

 
  const { settings } = useSettings();
  const { live, upcoming, finished, all, loading, error, isMockData, refresh } = useMatches(true, settings.refreshInterval);
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<TabKey>(
  initialTab === 'upcoming' || initialTab === 'finished'
    ? initialTab
    : 'live'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [compFilter, setCompFilter] = useState('');

 const [selectedDateMatches, setSelectedDateMatches] = useState<Match[] | null>(null);
 const [dateLoading, setDateLoading] = useState(false);
 

  const competitions = useMemo(() => {
    const map = new Map<string, string>();
    all.forEach(m => map.set(m.competition.id, m.competition.name));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [all]);


  const handleDateChange = async (date: string) => {
    // Calendrier vidé
    if (!date) {
      setSelectedDate('');
      setSelectedDateMatches(null);
      setDateLoading(false);
      return;
    }

    // Seulement aujourd'hui, demain et après-demain
    if (date < todayKey || date > dayAfterTomorrowKey) {
      return;
    }

    setSelectedDate(date);

    // Aujourd'hui
    if (date === todayKey) {
      setActiveTab('upcoming');
      setSelectedDateMatches(null);
      setDateLoading(false);
      return;
    }

    // Demain / après-demain
    setActiveTab('upcoming');
    setDateLoading(true);

    try {
      const result = await fetchMatchesByDate(date);

      if (result.error || !result.data) {
        setSelectedDateMatches([]);
        return;
      }

      setSelectedDateMatches(result.data);
    } catch (error) {
      console.error('Erreur lors du chargement de la date :', error);
      setSelectedDateMatches([]);
    } finally {
      setDateLoading(false);
    }
  };

  function filterMatches(matches: Match[]): Match[] {
    let result = matches;
    if (selectedDate) result = result.filter(m => m.kickoff.startsWith(selectedDate));
    if (compFilter) result = result.filter(m => m.competition.id === compFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.homeTeam.name.toLowerCase().includes(q) ||
        m.awayTeam.name.toLowerCase().includes(q)
      );
    }
    return result;
  }

  const filteredLive = filterMatches(live);

  const upcomingSource =
    selectedDateMatches !== null
      ? selectedDateMatches
      : upcoming;

  const filteredUpcoming = filterMatches(
    upcomingSource.filter((match) => {
      const kickoffTime = new Date(match.kickoff).getTime();

      if (Number.isNaN(kickoffTime)) {
        return false;
      }

      return kickoffTime > Date.now();
    })
  );

 const filteredFinished = filterMatches(finished);


  const groupedByCompetition = useMemo(() => {
    let source: Match[] = [];
    if (activeTab === 'live') source = filteredLive;
    else if (activeTab === 'upcoming') source = filteredUpcoming;
    else source = filteredFinished;

    const groups = new Map<string, { compName: string; matches: Match[] }>();
    source.forEach(m => {
      if (!groups.has(m.competition.id)) {
        groups.set(m.competition.id, { compName: m.competition.name, matches: [] });
      }
      groups.get(m.competition.id)!.matches.push(m);
    });
    return Array.from(groups.entries()).map(([id, g]) => ({ id, ...g }));
  }, [activeTab, filteredLive, filteredUpcoming, filteredFinished]);

 const tabs = [
  {
    key: 'live',
    label: 'En direct',
    count: filteredLive.length,
  },
  {
    key: 'upcoming',
    label: 'À venir',
    count: filteredUpcoming.length,
  },
  {
    key: 'finished',
    label: 'Terminés',
    count: filteredFinished.length,
  },
];

  const currentFiltered = activeTab === 'live' ? filteredLive : activeTab === 'upcoming' ? filteredUpcoming : filteredFinished;

  if (loading && all.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-ndembo-text">Matchs</h1>
        <LoadingSkeleton variant="list" count={8} />
      </div>
    );
  }

  if (error && all.length === 0) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ndembo-text">Matchs</h1>
        {isMockData && (
          <span className="text-xs text-ndembo-muted bg-ndembo-card border border-ndembo-border rounded-lg px-3 py-1">
            Mode démo
          </span>
        )}
      </div>

      <MatchFilters
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(key) => setActiveTab(key as TabKey)}
        date={selectedDate}
        onDateChange={handleDateChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        competitionFilter={compFilter}
        competitionOptions={competitions}
        onCompetitionChange={setCompFilter}
        onRefresh={refresh}
      />

      {dateLoading ? (
          <LoadingSkeleton variant="list" count={8} />
        ) : currentFiltered.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Aucun match trouvé"
            description="Aucun match ne correspond à vos filtres. Essayez de modifier la date, la compétition ou la recherche."
          />
        ) : activeTab === 'live' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3">
            {filteredLive.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {groupedByCompetition.map((group) => (
              <div key={group.id}>
                <p className="text-xs text-ndembo-muted uppercase tracking-wide mb-2 px-1">
                  {group.compName}
                </p>

                <MatchList
                  matches={group.matches}
                  showReminder={activeTab === 'upcoming'}
                />
              </div>
            ))}
          </div>
        )}
    </div>
  );
}


