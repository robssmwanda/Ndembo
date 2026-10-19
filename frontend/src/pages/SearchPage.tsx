import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Calendar, Trophy, Shield } from 'lucide-react';
import { useMatches } from '@/lib/useMatches';
import { TeamLogo } from '@/components/TeamLogo';
import { CompetitionBadge } from '@/components/CompetitionBadge';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import type { Match, Competition, Team } from '@/types';

interface TeamResult {
  team: Team;
  competition?: Competition;
  matchId?: string;
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { all, loading } = useMatches(false);
  const query = searchParams.get('q') || '';
  const [input, setInput] = useState(query);

  useEffect(() => {
    setInput(query);
  }, [query]);

  const results = useMemo(() => {
    if (!query.trim()) return { teams: [] as TeamResult[], competitions: [] as Competition[], matches: [] as Match[] };
    const q = query.toLowerCase();

    const teamsMap = new Map<string, TeamResult>();
    const compsMap = new Map<string, Competition>();
    const matches: Match[] = [];

    all.forEach(m => {
      if (m.homeTeam.name.toLowerCase().includes(q) || m.awayTeam.name.toLowerCase().includes(q)) {
        matches.push(m);
        if (m.homeTeam.name.toLowerCase().includes(q) && !teamsMap.has(m.homeTeam.id)) {
          teamsMap.set(m.homeTeam.id, { team: m.homeTeam, competition: m.competition, matchId: m.id });
        }
        if (m.awayTeam.name.toLowerCase().includes(q) && !teamsMap.has(m.awayTeam.id)) {
          teamsMap.set(m.awayTeam.id, { team: m.awayTeam, competition: m.competition, matchId: m.id });
        }
      }
      if (m.competition.name.toLowerCase().includes(q) || (m.competition.country || '').toLowerCase().includes(q)) {
        if (!compsMap.has(m.competition.id)) {
          compsMap.set(m.competition.id, m.competition);
        }
      }
    });

    return {
      teams: Array.from(teamsMap.values()),
      competitions: Array.from(compsMap.values()),
      matches: matches.slice(0, 20),
    };
  }, [query, all]);

  const totalResults = results.teams.length + results.competitions.length + results.matches.length;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearchParams(input.trim() ? { q: input.trim() } : {});
  }

  if (loading && all.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-ndembo-text">Recherche</h1>
        <LoadingSkeleton variant="list" count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-ndembo-text">Recherche</h1>

      {/* Search input */}
      <form onSubmit={handleSubmit} className="relative max-w-lg">
        <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ndembo-muted" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Rechercher équipes, compétitions, matchs..."
          autoFocus
          className="w-full bg-ndembo-card border border-ndembo-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-ndembo-text placeholder:text-ndembo-muted focus:outline-none focus:border-ndembo-neon/50 transition-colors"
        />
      </form>

      {query && (
        <p className="text-sm text-ndembo-muted">
          {totalResults > 0
            ? `${totalResults} résultat(s) pour "${query}"`
            : `Aucun résultat pour "${query}"`}
        </p>
      )}

      {/* Results */}
      {query && totalResults === 0 && (
        <EmptyState
          icon={SearchIcon}
          title="Aucun résultat trouvé"
          description="Essayez avec un autre nom d'équipe, de compétition ou de match. La recherche fonctionne sur les données disponibles dans l'application."
        />
      )}

      {!query && (
        <EmptyState
          icon={SearchIcon}
          title="Recherche globale"
          description="Tapez le nom d'une équipe, d'une compétition ou d'un match pour trouver des résultats parmi toutes les données disponibles."
        />
      )}

      {/* Teams results */}
      {results.teams.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-ndembo-neon" />
            <h2 className="text-sm font-semibold text-ndembo-text">Équipes ({results.teams.length})</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {results.teams.map(({ team, competition, matchId }) => (
              <Link
                key={team.id}
                to={matchId ? `/matches/${matchId}` : '/matches'}
                className="bg-ndembo-card border border-ndembo-border rounded-xl p-3 flex items-center gap-3 hover:border-ndembo-neon/30 transition-colors group"
              >
                <TeamLogo name={team.name} shortName={team.shortName} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ndembo-text truncate group-hover:text-ndembo-neon transition-colors">{team.name}</p>
                  {competition && <p className="text-xs text-ndembo-muted truncate">{competition.name}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Competitions results */}
      {results.competitions.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={16} className="text-ndembo-neon" />
            <h2 className="text-sm font-semibold text-ndembo-text">Compétitions ({results.competitions.length})</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {results.competitions.map(comp => (
              <Link
                key={comp.id}
                to={`/competitions/${comp.id}`}
                className="bg-ndembo-card border border-ndembo-border rounded-xl p-3 flex items-center gap-3 hover:border-ndembo-neon/30 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-ndembo-border/30 flex items-center justify-center text-xs font-bold text-ndembo-neon">
                  {comp.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ndembo-text truncate group-hover:text-ndembo-neon transition-colors">{comp.name}</p>
                  {comp.country && <p className="text-xs text-ndembo-muted truncate">{comp.country}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Matches results */}
      {results.matches.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-ndembo-neon" />
            <h2 className="text-sm font-semibold text-ndembo-text">Matchs ({results.matches.length})</h2>
          </div>
          <div className="bg-ndembo-card border border-ndembo-border rounded-xl overflow-hidden">
            {results.matches.map((match, idx) => (
              <Link
                key={match.id}
                to={`/matches/${match.id}`}
                className={`flex items-center gap-3 p-3 border-b border-ndembo-border/50 last:border-0 hover:bg-ndembo-cardHover transition-colors ${idx % 2 === 1 ? 'bg-ndembo-bg/30' : ''}`}
              >
                <CompetitionBadge name={match.competition.name} />
                <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
                  <span className="text-sm text-ndembo-text truncate">{match.homeTeam.name}</span>
                  {match.homeScore !== null ? (
                    <span className="text-sm font-mono font-bold text-ndembo-text flex-shrink-0">{match.homeScore} - {match.awayScore}</span>
                  ) : (
                    <span className="text-xs text-ndembo-muted flex-shrink-0">vs</span>
                  )}
                  <span className="text-sm text-ndembo-text truncate">{match.awayTeam.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
