import { useState, useMemo } from 'react';
import { fetchMatchesByDate } from '@/lib/api';
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
import type { Match } from '@/types';

type FilterKey = 'today' | 'live' | 'upcoming' | 'finished';

/**
 * Retourne la date locale d'un match sous la forme YYYY-MM-DD.
 * On utilise la date locale du navigateur pour que "Aujourd'hui"
 * corresponde au jour affiché à l'utilisateur.
 */
function localDateKey(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function HomePage() {
  const { settings } = useSettings();

  const {
    live,
    upcoming,
    finished,
    all,
    loading,
    error,
    isMockData,
    refresh,
  } = useMatches(true, settings.refreshInterval);

  const now = new Date();

  const todayKey = localDateKey(now);
  const tomorrowKey = localDateKey(addDays(now, 1));
  const dayAfterTomorrowKey = localDateKey(addDays(now, 2));

const [activeFilter, setActiveFilter] = useState<FilterKey>('today');
const [showAllToday, setShowAllToday] = useState(false);
const [showAllFinished, setShowAllFinished] = useState(false);
const [showAllUpcoming, setShowAllUpcoming] = useState(false);
const [selectedDate, setSelectedDate] = useState(todayKey);

const [selectedDateMatches, setSelectedDateMatches] = useState<Match[] | null>(null);
const [dateLoading, setDateLoading] = useState(false);

  

  /**
   * Liste des compétitions présentes dans les données chargées.
   */
  const competitions = useMemo(() => {
    const map = new Map<string, string>();

    all.forEach((match) => {
      map.set(
        match.competition.id,
        match.competition.name
      );
    });

    return Array.from(map.entries()).map(
      ([id, name]) => ({
        id,
        name,
      })
    );
  }, [all]);


  const todaysMatches = useMemo(() => {
    const currentTime = Date.now();

    return upcoming.filter((match) => {
      const kickoffTime = new Date(match.kickoff).getTime();

      if (Number.isNaN(kickoffTime)) {
        return false;
      }

      return (
        localDateKey(match.kickoff) === todayKey &&
        kickoffTime > currentTime
      );
    });
  }, [upcoming, todayKey]);


    const handleDateChange = async (date: string) => {

    // Champ calendrier vidé
    if (!date) {
      setSelectedDate('');
      setSelectedDateMatches(null);
      setActiveFilter('today');
      setDateLoading(false);
      return;
    }

    // Sécurité : uniquement aujourd'hui, demain et après-demain
    if (date < todayKey || date > dayAfterTomorrowKey) {
      return;
    }

    setSelectedDate(date);

    // ==========================================
    // AUJOURD'HUI
    // ==========================================
    if (date === todayKey) {
      setSelectedDateMatches(null);
      setActiveFilter('today');
      return;
    }

    // ==========================================
    // DEMAIN + APRÈS-DEMAIN
    // ==========================================
    setActiveFilter('upcoming');
    setDateLoading(true);

    try {
      const result = await fetchMatchesByDate(date);

      if (result.error || !result.data) {
        setSelectedDateMatches([]);
        return;
      }

      setSelectedDateMatches(result.data);
    } catch (error) {
      console.error(
        'Erreur lors du chargement des matchs par date:',
        error
      );

      setSelectedDateMatches([]);
    } finally {
      setDateLoading(false);
    }
  };
  /**
   * ============================================================
   * EN DIRECT
   * ============================================================
   *
   * On utilise exclusivement la réponse /api/live.
   */
  const filteredLive = useMemo(() => {
    if (activeFilter !== 'live') {
      return [];
    }

    let result = live;

    if (selectedDate) {
      result = result.filter(
        (match) =>
          localDateKey(match.kickoff) === selectedDate
      );
    }

    return result;
  }, [live, activeFilter, selectedDate]);

  /**
   * ============================================================
   * AUJOURD'HUI
   * ============================================================
   *
   * Aucun match LIVE.
   * Aucun match terminé.
   * Seulement les matchs d'aujourd'hui dont le coup d'envoi
   * n'a pas encore eu lieu.
   */
  const filteredToday = useMemo(() => {
    if (activeFilter !== 'today') {
      return [];
    }

    const currentTime = Date.now();

    let result = upcoming.filter((match) => {
      const kickoffTime = new Date(match.kickoff).getTime();

      if (Number.isNaN(kickoffTime)) {
        return false;
      }

      return (
        localDateKey(match.kickoff) === todayKey &&
        kickoffTime > currentTime
      );
    });

    if (selectedDate) {
      result = result.filter(
        (match) =>
          localDateKey(match.kickoff) === selectedDate
      );
    }

    return result;
  }, [
    upcoming,
    activeFilter,
    selectedDate,
    todayKey,
  ]);

  /**
   * ============================================================
   * À VENIR
   * ============================================================
   *
   * UNIQUEMENT :
   * - demain
   * - après-demain
   *
   * Même si le backend récupère 7 jours de matchs,
   * l'onglet Ndembo n'affiche que ces 2 jours.
   */
 const upcomingMatches = useMemo(() => {
  const now = Date.now();

  return upcoming.filter((match) => {
    const kickoffTime = new Date(match.kickoff).getTime();

    if (Number.isNaN(kickoffTime)) {
      return false;
    }

    return kickoffTime > now;
  });
}, [upcoming]);


    const filteredUpcoming = useMemo(() => {
    // L'onglet "À venir" est le seul qui doit afficher
    // les matchs à venir.
    if (activeFilter !== 'upcoming') {
      return [];
    }

    if (selectedDateMatches !== null) {
      return selectedDateMatches.filter(
        (match) => match.status === 'upcoming'
      );
    }

    return upcomingMatches;
  }, [
    activeFilter,
    upcomingMatches,
    selectedDateMatches,
  ]);

  const upcomingCount = useMemo(() => {
  if (selectedDateMatches !== null) {
    return selectedDateMatches.filter((match) => {
      const kickoffTime = new Date(match.kickoff).getTime();

      return (
        match.status === 'upcoming' &&
        !Number.isNaN(kickoffTime) &&
        kickoffTime > Date.now()
      );
    }).length;
  }

  return upcomingMatches.length;
}, [selectedDateMatches, upcomingMatches]);


const tabs = [
  {
    key: 'today',
    label: "Aujourd'hui",
    count: todaysMatches.length,
  },
  {
    key: 'live',
    label: 'En direct',
    count: live.length,
  },
  {
    key: 'upcoming',
    label: 'À venir',
    count:  upcomingCount
  },
  {
    key: 'finished',
    label: 'Terminés',
    count: finished.length,
  },
];

  /**
   * ============================================================
   * TERMINÉS
   * ============================================================
   *
   * Les matchs terminés sont UNIQUEMENT dans cet onglet.
   * Ils ne sont plus affichés dans "Aujourd'hui".
   */
  const filteredFinished = useMemo(() => {
    if (activeFilter !== 'finished') {
      return [];
    }

    let result = finished;

    if (selectedDate) {
      result = result.filter(
        (match) =>
          localDateKey(match.kickoff) === selectedDate
      );
    }

    return result;
  }, [
    finished,
    activeFilter,
    selectedDate,
  ]);

  /**
   * Regroupement des matchs terminés par compétition.
   */
  const finishedByCompetition = useMemo(() => {
    const groups = new Map<
      string,
      {
        compName: string;
        matches: Match[];
      }
    >();

    filteredFinished.forEach((match) => {
      if (!groups.has(match.competition.id)) {
        groups.set(match.competition.id, {
          compName: match.competition.name,
          matches: [],
        });
      }

      groups
        .get(match.competition.id)!
        .matches.push(match);
    });

    return Array.from(groups.entries()).map(
      ([id, group]) => ({
        id,
        ...group,
      })
    );
  }, [filteredFinished]);

  /**
   * ============================================================
   * COMPTEURS DES ONGLETS
   * ============================================================
   *
   * Les compteurs utilisent exactement les mêmes listes
   * que les onglets.
   */

  const heroImage =
    'https://images.pexels.com/photos/28827841/pexels-photo-28827841.jpeg?auto=compress&cs=tinysrgb&w=1600';

  /**
   * État de chargement.
   */
  
  if (loading && all.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-ndembo-border border-t-ndembo-neon rounded-full animate-spin" />
          <span className="absolute text-ndembo-neon font-bold text-xs">
            N
          </span>
        </div>

        <p className="text-sm text-ndembo-muted animate-pulse">
          Chargement des données NDEMBO...
        </p>
      </div>
    );
  }

  /**
   * État d'erreur.
   */
  if (error && all.length === 0) {
    return (
      <ErrorState
        message={error}
        onRetry={refresh}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ======================================================
          HERO BANNER
      ======================================================= */}
      <div className="relative h-56 lg:h-72 rounded-2xl overflow-hidden border border-ndembo-border">

        <img
          src={heroImage}
          alt="Football stadium"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display =
              'none';
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-ndembo-bg via-ndembo-bg/80 to-ndembo-bg/30" />

        <div className="absolute inset-0 bg-gradient-to-t from-ndembo-bg via-transparent to-transparent" />

        <div className="relative h-full flex flex-col justify-center px-6 lg:px-10 max-w-2xl">

          <div className="inline-flex items-center gap-1.5 bg-ndembo-neon/15 border border-ndembo-neon/30 rounded-full px-3 py-1 w-fit mb-3">
            <Radio
              size={12}
              className="text-ndembo-neon"
            />

            <span className="text-[10px] font-bold text-ndembo-neon uppercase tracking-wider">
              Live Now
            </span>
          </div>

          <h1 className="text-2xl lg:text-4xl font-bold text-ndembo-text leading-tight mb-2">
            Experience Football in Real Time with{' '}
            <span className="text-ndembo-neon">
              Ndembo
            </span>
          </h1>

          <p className="text-sm lg:text-base text-ndembo-muted max-w-lg">
            Live scores, results, standings, and news from
            the world's biggest competitions.
          </p>

          {/* Dynamic indicators */}
          <div className="flex items-center gap-4 lg:gap-6 mt-5">

            {/* LIVE */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-ndembo-live/15 flex items-center justify-center">
                <Radio
                  size={14}
                  className="text-ndembo-live"
                />
              </div>

              <div>
                <p className="text-lg font-bold text-ndembo-text leading-none">
                  {live.length}
                </p>

                <p className="text-[10px] text-ndembo-muted mt-0.5">
                  En direct
                </p>
              </div>
            </div>

            <div className="w-px h-8 bg-ndembo-border" />

            {/* AUJOURD'HUI */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-ndembo-accent/15 flex items-center justify-center">
                <Calendar
                  size={14}
                  className="text-ndembo-accent"
                />
              </div>

              <div>
                <p className="text-lg font-bold text-ndembo-text leading-none">
                  {todaysMatches.length}
                </p>

                <p className="text-[10px] text-ndembo-muted mt-0.5">
                  Aujourd'hui
                </p>
              </div>
            </div>

            <div className="w-px h-8 bg-ndembo-border" />

            {/* COMPÉTITIONS */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-ndembo-neon/15 flex items-center justify-center">
                <Trophy
                  size={14}
                  className="text-ndembo-neon"
                />
              </div>

              <div>
                <p className="text-lg font-bold text-ndembo-text leading-none">
                  {competitions.length}
                </p>

                <p className="text-[10px] text-ndembo-muted mt-0.5">
                  Compétitions
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Mode démo */}
      {isMockData && (
        <div className="flex items-center gap-2 bg-ndembo-card border border-ndembo-border rounded-lg px-4 py-2 text-xs text-ndembo-muted">
          <Zap
            size={12}
            className="text-ndembo-neon"
          />

          Mode démo — le backend n'est pas connecté.
          Les données affichées sont simulées.
        </div>
      )}

      {/* ======================================================
          ONGLETS
      ======================================================= */}
      <MatchFilters
        tabs={tabs}
        activeTab={activeFilter}
        onTabChange={(key) =>
          setActiveFilter(key as FilterKey)
        }
        date={selectedDate}
        onDateChange={handleDateChange}
        onRefresh={refresh}
      />

      {/* ======================================================
          EN DIRECT
      ======================================================= */}
      {filteredLive.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-ndembo-live rounded-full animate-pulse-live" />

              <h2 className="text-lg font-bold text-ndembo-text">
                Live Matches
              </h2>

              <span className="text-xs text-ndembo-muted">
                ({filteredLive.length})
              </span>
            </div>

            <Link
              to="/matches"
              className="text-xs text-ndembo-neon hover:underline flex items-center gap-0.5"
            >
              Voir tout
              <ChevronRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3">
            {filteredLive.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
              />
            ))}
          </div>
        </section>
      )}

      {/* ======================================================
          AUJOURD'HUI
      ======================================================= */}
      {filteredToday.length > 0 && (
       <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-ndembo-text">
              Matchs d'aujourd'hui
            </h2>

            <span className="text-xs text-ndembo-muted">
              ({filteredToday.length})
            </span>
          </div>

        <button
          type="button"
          onClick={() => setShowAllToday((value) => !value)}
          className="text-xs text-ndembo-neon hover:underline"
        >
          {showAllToday ? 'Voir moins' : 'Voir tout'}
        </button>
      </div>

      <MatchList
        matches={
          showAllToday
            ? filteredToday
            : filteredToday.slice(0, 8)
        }
        showReminder
      />
</section>
      )}

      {/* ======================================================
          À VENIR
      ======================================================= */}
      {filteredUpcoming.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">

            <div>
             <h2 className="text-lg font-bold text-ndembo-text">
                Matchs du{' '}
                {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
                  'fr-FR',
                  {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }
                )}
              </h2>

              <span className="text-xs text-ndembo-muted">
                Demain et après-demain ({filteredUpcoming.length})
              </span>
            </div>

            <button
                type="button"
                onClick={() => setShowAllUpcoming((value) => !value)}
                className="text-xs text-ndembo-neon hover:underline flex items-center gap-0.5"
              >
                {showAllUpcoming ? 'Voir moins' : 'Voir tout'}
                <ChevronRight size={12} />
              </button>

          </div>

              <MatchList
                matches={
                  showAllUpcoming
                    ? filteredUpcoming
                    : filteredUpcoming.slice(0, 8)
                }
                showReminder
              />
        </section>
      )}

      {/* ======================================================
          TERMINÉS
      ======================================================= */}
      {finishedByCompetition.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-ndembo-text">
                Résultats
              </h2>

              <span className="text-xs text-ndembo-muted">
                ({filteredFinished.length})
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowAllFinished((value) => !value)}
              className="text-xs text-ndembo-neon hover:underline"
            >
              {showAllFinished ? 'Voir moins' : 'Voir tout'}
            </button>
          </div>

          <div className="space-y-4">

            {finishedByCompetition
              .slice(0, showAllFinished ? finishedByCompetition.length : 5)
              .map((group) => (
                <div key={group.id}>

                  <p className="text-xs text-ndembo-muted uppercase tracking-wide mb-2 px-1">
                    {group.compName}
                  </p>

                  <MatchList
                    matches={
                      showAllFinished
                        ? group.matches
                        : group.matches.slice(0, 5)
                    }
                  />

                </div>
              ))}

          </div>
      </section>
      )}

      {/* ======================================================
          AUCUN MATCH
      ======================================================= */}
      {filteredLive.length === 0 &&
        filteredToday.length === 0 &&
        filteredUpcoming.length === 0 &&
        filteredFinished.length === 0 && (
          <EmptyState
            icon={Calendar}
            title="Aucun match trouvé"
            description="Aucun match ne correspond aux filtres sélectionnés pour cette date."
          />
        )}

    </div>
  );
}