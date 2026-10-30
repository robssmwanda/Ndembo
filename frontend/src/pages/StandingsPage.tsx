import { useState, useMemo, useEffect } from 'react';
import { Trophy, RefreshCw,ChevronDown,AlertCircle,} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMatches } from '@/lib/useMatches';
import { fetchCountries, fetchCompetitionsByCountry, fetchStandings } from '@/lib/api';
import { TeamLogo } from '@/components/TeamLogo';
import { EmptyState } from '@/components/EmptyState';
import { CompetitionBadge } from '@/components/CompetitionBadge';

import type { Standings, StandingRow } from '@/types';

type TabKey = 'standings' | 'matches' | 'stats' | 'teams';

export function StandingsPage() {
  const { all, loading, error, isMockData, refresh } = useMatches(false);

const [countries, setCountries] = useState<any[]>([]);
const [countriesLoading, setCountriesLoading] = useState(true);
const [countriesError, setCountriesError] = useState<string | null>(null);
const [selectedCountry, setSelectedCountry] = useState('');
const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
const [countryCompetitions, setCountryCompetitions] = useState< Competition[]>([]);

const [competitionsLoading, setCompetitionsLoading] = useState(false);
const [competitionsError, setCompetitionsError] = useState<string | null>(null,);

const [selectedComp, setSelectedComp] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<number>(
    new Date().getFullYear(),
  );

  const [standings, setStandings] = useState<Standings | undefined>(
    undefined,
  );

  const [standingsLoading, setStandingsLoading] = useState(true);
  const [standingsError, setStandingsError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>('standings');
  const [refreshKey, setRefreshKey] = useState(0);


  useEffect(() => {
  const controller = new AbortController();
  let cancelled = false;

  async function loadCountries() {
    setCountriesLoading(true);
    setCountriesError(null);

    try {
      const result = await fetchCountries(controller.signal);

      if (cancelled || controller.signal.aborted) {
        return;
      }

      if (result.error) {
        setCountriesError(result.error);
        setCountries([]);
        return;
      }

      const data = Array.isArray(result.data) ? result.data : [];

      setCountries(data);

      // Sélectionne automatiquement le premier pays disponible
      if (data.length > 0) {
        const firstCountry = data.find(
          (item: any) =>
            item.name ||
            item.country?.name ||
            item.country,
        );

        if (firstCountry) {
          const countryName =
            firstCountry.name ||
            firstCountry.country?.name ||
            firstCountry.country ||
            '';

          setSelectedCountry(countryName);
        }
      }
    } catch (err) {
      if (
        err instanceof DOMException &&
        err.name === 'AbortError'
      ) {
        return;
      }

      if (!cancelled) {
        setCountriesError(
          err instanceof Error
            ? err.message
            : 'Failed to load countries',
        );
      }
    } finally {
      if (!cancelled && !controller.signal.aborted) {
        setCountriesLoading(false);
      }
    }
  }

  loadCountries();

  return () => {
    cancelled = true;
    controller.abort();
  };
}, []);

  /*
   * ------------------------------------------------------------
   * COMPETITIONS
   * ------------------------------------------------------------
   */

   useEffect(() => {
  if (!selectedCountry) {
    setCountryCompetitions([]);
    setSelectedComp('');
    setCompetitionsLoading(false);
    return;
  }

  const controller = new AbortController();
  let cancelled = false;

  async function loadCompetitions() {
    setCompetitionsLoading(true);
    setCompetitionsError(null);

    // On enlève l'ancien championnat pendant le chargement
    setCountryCompetitions([]);
    setSelectedComp('');

    try {
      const result = await fetchCompetitionsByCountry(
        selectedCountry,
        controller.signal,
      );

      if (cancelled || controller.signal.aborted) {
        return;
      }

      if (result.error) {
        setCountryCompetitions([]);
        setCompetitionsError(result.error);
        return;
      }

      const competitions = Array.isArray(result.data)
        ? result.data
        : [];

      setCountryCompetitions(competitions);

      // Sélectionne automatiquement le premier championnat
      if (competitions.length > 0) {
        setSelectedComp(String(competitions[0].id));
      }
    } catch (err) {
      if (
        err instanceof DOMException &&
        err.name === 'AbortError'
      ) {
        return;
      }

      if (!cancelled) {
        setCountryCompetitions([]);
        setCompetitionsError(
          err instanceof Error
            ? err.message
            : 'Failed to load competitions',
        );
      }
    } finally {
      if (!cancelled && !controller.signal.aborted) {
        setCompetitionsLoading(false);
      }
    }
  }

  loadCompetitions();

  return () => {
    cancelled = true;
    controller.abort();
  };
}, [selectedCountry]);

    const currentCompId = selectedComp;

    const currentComp = countryCompetitions.find(
      (competition) =>
        String(competition.id) === String(currentCompId),
    );
     const selectedCountryData = countries.find((country: any) => {
    const name =
      country.name ||
      country.country?.name ||
      country.country ||
      '';

    return name === selectedCountry;
  });

  const selectedCountryCode =
    selectedCountryData?.code ||
    selectedCountryData?.countryCode ||
    selectedCountryData?.country?.code ||'';

  /*
   * ------------------------------------------------------------
   * SEASONS
   * ------------------------------------------------------------
   */

  const seasons = useMemo(() => {
    const currentYear = new Date().getFullYear();

    return [
      currentYear,
      currentYear - 1,
      currentYear - 2,
    ];
  }, []);

  /*
   * ------------------------------------------------------------
   * LOAD STANDINGS
   * ------------------------------------------------------------
   *
   * Important:
   * We use a cancellation guard so an old/aborted request cannot
   * turn loading=false while a newer request is still running.
   */

  useEffect(() => {
    if (!currentCompId) {
      setStandings(undefined);
      setStandingsError(null);
      setStandingsLoading(false);

      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    async function load() {
      setStandingsLoading(true);
      setStandingsError(null);

      try {
        const result = await fetchStandings(
          currentCompId,
          selectedSeason,
          controller.signal,
        );

        if (cancelled || controller.signal.aborted) {
          return;
        }

        if (result.error) {
          setStandings(undefined);
          setStandingsError(result.error);
        } else {
          setStandings(result.data ?? undefined);
          setStandingsError(null);
        }
      } catch (err) {
        if (
          err instanceof DOMException &&
          err.name === 'AbortError'
        ) {
          return;
        }

        if (!cancelled && !controller.signal.aborted) {
          setStandings(undefined);
          setStandingsError(
            err instanceof Error
              ? err.message
              : 'Failed to load standings',
          );
        }
      } finally {
        if (!cancelled && !controller.signal.aborted) {
          setStandingsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [currentCompId, selectedSeason, refreshKey]);

  /*
   * ------------------------------------------------------------
   * TABS
   * ------------------------------------------------------------
   */

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'standings', label: 'Standings' },
    { key: 'matches', label: 'Matches' },
    { key: 'stats', label: 'Stats' },
    { key: 'teams', label: 'Teams' },
  ];

  /*
   * ------------------------------------------------------------
   * INITIAL LOADING / ERROR
   * ------------------------------------------------------------
   */

  if (loading && all.length === 0) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-ndembo-text">
            Rankings
          </h1>

          <p className="text-sm text-ndembo-muted">
            View standings for available competitions
          </p>
        </div>

        <RankingsSkeleton />
      </div>
    );
  }

  if (error && all.length === 0) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-ndembo-text">
            Rankings
          </h1>

          <p className="text-sm text-ndembo-muted">
            View standings for available competitions
          </p>
        </div>

        <div className="bg-ndembo-card border border-ndembo-border rounded-2xl">
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-ndembo-live/10 flex items-center justify-center mb-4">
              <AlertCircle
                size={24}
                className="text-ndembo-live"
              />
            </div>

            <p className="text-sm text-ndembo-text mb-1 font-medium">
              Unable to retrieve standings.
            </p>

            <p className="text-xs text-ndembo-muted mb-4">
              {error}
            </p>

            <button
              onClick={refresh}
              className="inline-flex items-center gap-2 bg-ndembo-neon text-ndembo-bg text-sm font-bold px-4 py-2 rounded-lg hover:bg-ndembo-neonDim transition-colors"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ------------------------------------------------------------
   * PAGE
   * ------------------------------------------------------------
   */

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ndembo-text">
              Rankings
            </h1>

            <p className="text-sm text-ndembo-muted">
              View standings for available competitions
            </p>
          </div>

          {isMockData && (
            <span className="text-xs text-ndembo-muted bg-ndembo-card border border-ndembo-border rounded-lg px-3 py-1">
              Demo mode
            </span>
          )}
        </div>
      </div>

      {/* Competition / Season selectors */}

      {/* Country / Competition / Season selectors */}

  <div className="flex flex-col sm:flex-row sm:items-end gap-3">

    {/* Country */}
    <div className="flex-1 min-w-0">
      <label className="block text-[10px] uppercase tracking-wide text-ndembo-muted mb-1.5">
        Country
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() =>
            setCountryDropdownOpen((open) => !open)
          }
          disabled={countriesLoading}
          className="w-full bg-ndembo-card border border-ndembo-border rounded-lg px-3 py-2.5 text-sm text-ndembo-text focus:outline-none focus:border-ndembo-neon/50 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-between"
        >
        <span className="flex items-center gap-2">
          {selectedCountryCode ? (
            <img
              src={`https://flagcdn.com/w40/${selectedCountryCode.toLowerCase()}.png`}
              alt={selectedCountry}
              className="w-6 h-4 object-cover rounded-sm"
            />
          ) : null}

          <span>
            {countriesLoading
              ? 'Loading countries...'
              : selectedCountry || 'Select country'}
          </span>
        </span>

    <ChevronDown
      size={16}
      className="text-ndembo-muted"
    />
  </button>

  {countryDropdownOpen && !countriesLoading && (
    <div className="absolute z-50 mt-1 w-full max-h-80 overflow-y-auto bg-ndembo-card border border-ndembo-border rounded-lg shadow-xl">
      {countries.length === 0 ? (
        <div className="px-3 py-2.5 text-sm text-ndembo-muted">
          No countries
        </div>
      ) : (
          countries
            .map((country: any) => ({
              name:
                country.name ||
                country.country?.name ||
                country.country ||
                '',
              code:
                country.code ||
                country.countryCode ||
                country.country?.code ||
                '',
            }))
            .filter((country) => country.name)
            .sort((a, b) =>
              a.name.localeCompare(b.name),
            )
            .map((country) => (
              <button
                key={country.name}
                type="button"
                onClick={() => {
                  setSelectedCountry(country.name);
                  setSelectedComp('');
                  setCountryDropdownOpen(false);
                }}
                className={`w-full px-3 py-2 flex items-center gap-2 text-left text-sm transition-colors hover:bg-ndembo-border ${
                  selectedCountry === country.name
                    ? 'bg-ndembo-border text-ndembo-text'
                    : 'text-ndembo-text'
                }`}
              >
                {country.code &&
                /^[A-Za-z]{2}$/.test(country.code) ? (
                  <img
                    src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                    alt={country.name}
                    className="w-6 h-4 object-cover rounded-sm flex-shrink-0"
                  />
                ) : (
                  <span className="w-6 text-center">
                    🌍
                  </span>
                )}

                <span>{country.name}</span>
              </button>
            ))
        )}
      </div>
    )}
  </div>

      {countriesError && (
        <p className="mt-1 text-xs text-ndembo-live">
          {countriesError}
        </p>
      )}
    </div>

    {/* Competition */}
    <div className="flex-1 min-w-0">
      <label className="block text-[10px] uppercase tracking-wide text-ndembo-muted mb-1.5">
        Competition
      </label>

      <div className="relative">
        <select
          value={selectedComp}
          onChange={(event) =>
            setSelectedComp(event.target.value)
          }
          disabled={
            !selectedCountry ||
            competitionsLoading ||
            countryCompetitions.length === 0
          }
          className="w-full appearance-none bg-ndembo-card border border-ndembo-border rounded-lg px-3 py-2.5 pr-9 text-sm text-ndembo-text focus:outline-none focus:border-ndembo-neon/50 transition-colors cursor-pointer disabled:opacity-50"
        >
          {competitionsLoading ? (
            <option value="">
              Loading competitions...
            </option>
          ) : countryCompetitions.length === 0 ? (
            <option value="">
              No competitions
            </option>
          ) : (
            countryCompetitions.map((competition) => (
              <option
                key={competition.id}
                value={String(competition.id)}
              >
                {competition.name}
              </option>
            ))
          )}
        </select>

        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ndembo-muted pointer-events-none"
        />
      </div>

      {competitionsError && (
        <p className="mt-1 text-xs text-ndembo-live">
          {competitionsError}
        </p>
      )}
    </div>

  {/* Season */}
  <div className="w-full sm:w-32">
    <label className="block text-[10px] uppercase tracking-wide text-ndembo-muted mb-1.5">
      Season
    </label>

    <div className="relative">
      <select
        value={selectedSeason}
        onChange={(event) =>
          setSelectedSeason(
            Number(event.target.value),
          )
        }
        className="w-full appearance-none bg-ndembo-card border border-ndembo-border rounded-lg px-3 py-2.5 pr-9 text-sm text-ndembo-text focus:outline-none focus:border-ndembo-neon/50 transition-colors cursor-pointer"
      >
        {seasons.map((season) => (
          <option key={season} value={season}>
            {season}
          </option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-ndembo-muted pointer-events-none"
      />
    </div>
  </div>

  {/* Refresh */}
  <button
    onClick={() =>
      setRefreshKey((key) => key + 1)
    }
    className="inline-flex items-center justify-center gap-2 bg-ndembo-card border border-ndembo-border text-ndembo-text text-sm px-4 py-2.5 rounded-lg hover:border-ndembo-neon/30 hover:text-ndembo-neon transition-colors h-[42px] sm:self-end"
    aria-label="Refresh"
  >
    <RefreshCw
      size={14}
      className={
        standingsLoading ? 'animate-spin' : ''
      }
    />

    <span className="hidden sm:inline">
      Refresh
    </span>
  </button>

</div>

      {/* Standings content */}

      {standingsLoading ? (
        <RankingsSkeleton />
      ) : standingsError ? (
        <div className="bg-ndembo-card border border-ndembo-border rounded-2xl">
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-ndembo-live/10 flex items-center justify-center mb-4">
              <AlertCircle
                size={24}
                className="text-ndembo-live"
              />
            </div>

            <p className="text-sm text-ndembo-text mb-1 font-medium">
              Unable to retrieve standings.
            </p>

            <p className="text-xs text-ndembo-muted mb-4">
              {standingsError}
            </p>

            <button
              onClick={() =>
                setRefreshKey((key) => key + 1)
              }
              className="inline-flex items-center gap-2 bg-ndembo-neon text-ndembo-bg text-sm font-bold px-4 py-2 rounded-lg hover:bg-ndembo-neonDim transition-colors"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        </div>
      ) : !standings ||
        standings.table.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Standings unavailable"
          description={
            currentComp
              ? `No standings data is available for ${currentComp.name} in the selected season.`
              : 'No standings data is available for this competition in the selected season.'
          }
        />
      ) : (
        <>
          {/* Main competition card */}

          <div className="bg-ndembo-card border border-ndembo-border rounded-2xl overflow-hidden">
            {/* Card header */}

            <div className="p-5 border-b border-ndembo-border">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  {selectedCountryCode && (
                    <img
                      src={`https://flagcdn.com/w40/${selectedCountryCode.toLowerCase()}.png`}
                      alt={selectedCountry}
                      className="w-8 h-6 object-cover rounded"
                    />
                  )}

                  <div>
                    <div className="text-sm font-semibold text-ndembo-text">
                      {standings.competition.name}
                    </div>

                    <div className="text-xs text-ndembo-muted">
                      {selectedCountry}
                    </div>
                  </div>
                </div>

                <span className="text-xs text-ndembo-muted">
                  Season{' '}
                  {standings.season ??
                    selectedSeason}
                </span>
              </div>
            </div>

            {/* Internal tabs */}

            <div className="flex items-center gap-1 px-3 pt-3 border-b border-ndembo-border overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() =>
                    setActiveTab(tab.key)
                  }
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 relative -mb-px whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'text-ndembo-neon border-b-2 border-ndembo-neon'
                      : 'text-ndembo-muted hover:text-ndembo-text border-b-2 border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}

            <div className="p-4 sm:p-5">
              {/* Standings */}

              {activeTab === 'standings' && (
                <RankingsTable
                  rows={standings.table}
                  season={selectedSeason}
                />
              )}

              {/* Matches */}

              {activeTab === 'matches' && (
                <EmptyState
                  icon={Trophy}
                  title="Matches"
                  description="Match views for this competition are available on the Matches page."
                />
              )}

              {/* Stats */}

              {activeTab === 'stats' && (
                <EmptyState
                  icon={Trophy}
                  title="Stats"
                  description="Detailed statistics for this competition will appear here."
                />
              )}

              {/* Teams */}

              {activeTab === 'teams' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {standings.table.map((row) => (
                    <Link
                      key={row.team.id}
                      to={`/teams/${row.team.id}?season=${selectedSeason}`}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-ndembo-cardHover transition-colors group"
                    >
                      <TeamLogo
                        name={row.team.name}
                        shortName={row.team.shortName}
                        logo={row.team.logo}
                        size="sm"
                      />

                      <span className="text-sm text-ndembo-text truncate group-hover:text-ndembo-neon transition-colors">
                        {row.team.name}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {isMockData && (
            <p className="text-[10px] text-ndembo-muted text-center">
              Demo mode — using sample standings data
            </p>
          )}
        </>
      )}
    </div>
  );
}

/*
 * ------------------------------------------------------------
 * RANKINGS TABLE
 * ------------------------------------------------------------
 */

function RankingsTable({
  rows,
  season
}: {
  rows: StandingRow[];
  season: number;
}) {
  const tableCount = rows.length;

  return (
    <div className="overflow-x-auto -mx-4 sm:-mx-5 px-4 sm:px-5">
      <table className="w-full text-sm min-w-[680px]">
        <thead>
          <tr className="text-ndembo-muted text-[10px] uppercase tracking-wide border-b border-ndembo-border">
            <th className="py-3 px-2 text-center w-10">
              #
            </th>

            <th className="py-3 px-3 text-left">
              Team
            </th>

            <th className="py-3 px-2 text-center w-12">
              MP
            </th>

            <th className="py-3 px-2 text-center w-10">
              W
            </th>

            <th className="py-3 px-2 text-center w-10">
              D
            </th>

            <th className="py-3 px-2 text-center w-10">
              L
            </th>

            <th className="py-3 px-2 text-center w-12">
              GF
            </th>

            <th className="py-3 px-2 text-center w-12">
              GA
            </th>

            <th className="py-3 px-2 text-center w-12">
              GD
            </th>

            <th className="py-3 px-2 text-center w-12 font-bold text-ndembo-text">
              Pts
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            const isTopZone =
              row.position <= 2;

            const isMidZone =
              row.position >= 3 &&
              row.position <= 4;

            const isRelegZone =
              tableCount >= 6 &&
              row.position >= tableCount - 1;

            const zoneColor = isTopZone
              ? 'bg-ndembo-neon'
              : isMidZone
                ? 'bg-ndembo-accent'
                : isRelegZone
                  ? 'bg-ndembo-live'
                  : 'bg-transparent';

            return (
              <tr
                key={row.team.id}
                className="border-b border-ndembo-border/40 last:border-0 hover:bg-ndembo-cardHover transition-colors"
              >
                {/* Position */}

                <td className="py-3 px-2 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span
                      className={`w-1 h-4 rounded-full ${zoneColor}`}
                    />

                    <span className="text-ndembo-text font-mono text-xs font-semibold">
                      {row.position}
                    </span>
                  </div>
                </td>

                {/* Team */}

                <td className="py-3 px-3">
                  <Link
                    to={`/teams/${row.team.id}?season=${season}`}
                    className="flex items-center gap-2.5 group"
                  >
                   <TeamLogo
                      name={row.team.name}
                      shortName={row.team.shortName}
                      logo={row.team.logo}
                      size="sm"
                    />

                    <span className="text-ndembo-text truncate group-hover:text-ndembo-neon transition-colors">
                      {row.team.name}
                    </span>
                  </Link>
                </td>

                {/* Played */}

                <td className="py-3 px-2 text-center text-ndembo-text font-mono text-xs">
                  {row.played}
                </td>

                {/* Won */}

                <td className="py-3 px-2 text-center text-ndembo-muted font-mono text-xs">
                  {row.won}
                </td>

                {/* Drawn */}

                <td className="py-3 px-2 text-center text-ndembo-muted font-mono text-xs">
                  {row.drawn}
                </td>

                {/* Lost */}

                <td className="py-3 px-2 text-center text-ndembo-muted font-mono text-xs">
                  {row.lost}
                </td>

                {/* Goals For */}

                <td className="py-3 px-2 text-center text-ndembo-muted font-mono text-xs">
                  {row.goalsFor}
                </td>

                {/* Goals Against */}

                <td className="py-3 px-2 text-center text-ndembo-muted font-mono text-xs">
                  {row.goalsAgainst}
                </td>

                {/* Goal Difference */}

                <td className="py-3 px-2 text-center font-mono text-xs">
                  <span
                    className={
                      row.goalDifference > 0
                        ? 'text-ndembo-neon'
                        : row.goalDifference < 0
                          ? 'text-ndembo-live'
                          : 'text-ndembo-muted'
                    }
                  >
                    {row.goalDifference > 0
                      ? '+'
                      : ''}
                    {row.goalDifference}
                  </span>
                </td>

                {/* Points */}

                <td className="py-3 px-2 text-center font-bold text-ndembo-text font-mono">
                  {row.points}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/*
 * ------------------------------------------------------------
 * LOADING SKELETON
 * ------------------------------------------------------------
 */

function RankingsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-ndembo-card border border-ndembo-border rounded-2xl overflow-hidden">
        {/* Card header */}

        <div className="p-5 border-b border-ndembo-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="skeleton w-7 h-7 rounded" />

            <div className="skeleton h-4 w-40 rounded" />
          </div>

          <div className="skeleton h-4 w-20 rounded" />
        </div>

        {/* Tabs */}

        <div className="flex items-center gap-1 px-3 pt-3 border-b border-ndembo-border">
          <div className="skeleton h-8 w-24 rounded" />
          <div className="skeleton h-8 w-20 rounded" />
          <div className="skeleton h-8 w-16 rounded" />
          <div className="skeleton h-8 w-20 rounded" />
        </div>

        {/* Table */}

        <div className="p-4 sm:p-5">
          <div className="space-y-2">
            <div className="flex items-center gap-3 pb-2 border-b border-ndembo-border/40">
              <div className="skeleton h-3 w-8 rounded" />
              <div className="skeleton h-3 flex-1 max-w-[200px] rounded" />
              <div className="skeleton h-3 w-10 rounded" />
              <div className="skeleton h-3 w-10 rounded" />
              <div className="skeleton h-3 w-10 rounded" />
              <div className="skeleton h-3 w-10 rounded" />
              <div className="skeleton h-3 w-10 rounded" />
              <div className="skeleton h-3 w-10 rounded" />
            </div>

            {Array.from({ length: 10 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 py-2.5 border-b border-ndembo-border/30 last:border-0"
                >
                  <div className="skeleton h-4 w-6 rounded" />

                  <div className="skeleton w-6 h-6 rounded-full" />

                  <div className="skeleton h-4 flex-1 max-w-[180px] rounded" />

                  <div className="skeleton h-4 w-8 rounded" />
                  <div className="skeleton h-4 w-8 rounded" />
                  <div className="skeleton h-4 w-8 rounded" />
                  <div className="skeleton h-4 w-8 rounded" />
                  <div className="skeleton h-4 w-8 rounded" />
                  <div className="skeleton h-4 w-10 rounded" />
                  <div className="skeleton h-4 w-10 rounded" />
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}