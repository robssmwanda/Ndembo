import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Calendar, Trophy, Trash2, Users, Sparkles, Plus, X, Search, Check, LoaderCircle } from 'lucide-react';
import { useFavorites } from '@/lib/favorites';
import { useMatches } from '@/lib/useMatches';
import { TeamLogo } from '@/components/TeamLogo';
import { CompetitionBadge } from '@/components/CompetitionBadge';
import { LiveIndicator } from '@/components/LiveIndicator';
import { EmptyState } from '@/components/EmptyState';
import { formatTime, formatDate, statusLabel } from '@/lib/format';
import type { Match } from '@/types';

type TabKey = 'teams' | 'matches';

export function FavoritesPage() {
  const { getTeams, getMatches, removeFavorite, toggleFavorite, isFavorite } = useFavorites();
  const { all: allMatches, live: liveMatches } = useMatches();
  const [activeTab, setActiveTab] = useState<TabKey>('teams');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiTeams, setApiTeams] = useState<TeamPick[]>([]);
  const [isSearchingTeams, setIsSearchingTeams] = useState(false);
  const [teamSearchError, setTeamSearchError] = useState('');
  const navigate = useNavigate();

  const favTeams = getTeams();
  const favMatches = getMatches();

  // Enrich favorite matches with full match data when available
  const enrichedMatches = useMemo(() => {
    return favMatches.map(fav => {
      const full = allMatches.find(m => m.id === fav.id);
      return { fav, full };
    });
  }, [favMatches, allMatches]);

  // Live matches involving any favorite team
  const liveForFavTeams = useMemo(() => {
    const favTeamIds = new Set(favTeams.map(t => t.id));
    return liveMatches.filter(
      m => favTeamIds.has(m.homeTeam.id) || favTeamIds.has(m.awayTeam.id)
    );
  }, [liveMatches, favTeams]);

  // Derive unique teams from the matches feed
  const allTeams = useMemo(() => {
    const teamMap = new Map<string, { id: string; name: string; shortName?: string; logo?: string; competition: string;}>();

    for (const m of allMatches) {
      if (!teamMap.has(m.homeTeam.id)) {
        teamMap.set(m.homeTeam.id, {id: m.homeTeam.id, name: m.homeTeam.name, shortName: m.homeTeam.shortName, logo: m.homeTeam.logo,competition: m.competition.name });
      }
      if (!teamMap.has(m.awayTeam.id)) {
        teamMap.set(m.awayTeam.id, { id: m.awayTeam.id, name: m.awayTeam.name, shortName: m.awayTeam.shortName, logo: m.awayTeam.logo, competition: m.competition.name });
      }
    }
    return Array.from(teamMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allMatches]);

  // Filter teams by search query
 
    const filteredTeams = useMemo(() => {
      if (searchQuery.trim().length < 2) return allTeams;

      return apiTeams;
    }, [allTeams, apiTeams, searchQuery]);

    useEffect(() => {
      const query = searchQuery.trim();

      if (query.length < 2) {
        setApiTeams([]);
        setTeamSearchError('');
        setIsSearchingTeams(false);
        return;
      }

      const controller = new AbortController();
      setIsSearchingTeams(true);
      setApiTeams([]);
      setTeamSearchError('');

      const timeout = setTimeout(async () => {
        try {

          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ndembo-backend-txqd.onrender.com';
          const response = await fetch(`${API_BASE_URL}/api/teams/search?search=${encodeURIComponent(query)}`, 
            { signal: controller.signal }
          );

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error('Erreur de recherche');
          }

          setApiTeams(
            result.data.map((team: any) => ({
              id: String(team.id),
              name: team.name,
              shortName: team.name,
              competition: team.country || 'Club',
              logo: team.logo || undefined,
            }))
          );

        } catch (error) {
          if (!controller.signal.aborted) {
            setTeamSearchError('Impossible de rechercher les équipes.');
            setApiTeams([]);
          }
        } finally {
          if (!controller.signal.aborted) {
            setIsSearchingTeams(false);
          }
        }
      }, 300);

      return () => {
        clearTimeout(timeout);
        controller.abort();
      };
    }, [searchQuery]);


  const tabs: { key: TabKey; label: string; icon: typeof Star; count: number }[] = [
      { key: 'teams', label: 'Équipes', icon: Users, count: favTeams.length },
      { key: 'matches', label: 'Matchs', icon: Calendar, count: favMatches.length },
    ];



  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ndembo-text">Favoris</h1>
          <p className="text-sm text-ndembo-muted mt-0.5">
            Vos équipes et matchs préférés, suivis en un coup d'œil.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-ndembo-muted">
          <Sparkles size={14} className="text-ndembo-neon" />
          <span>{favTeams.length + favMatches.length} favoris au total</span>
        </div>
      </div>

      {/* Tabs + Add Team button */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-ndembo-card border border-ndembo-border rounded-xl p-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'bg-ndembo-neon text-ndembo-bg'
                    : 'text-ndembo-muted hover:text-ndembo-text'
                }`}
              >
                <Icon size={15} />
                {tab.label}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    activeTab === tab.key ? 'bg-ndembo-bg/20' : 'bg-ndembo-border/50'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
        {activeTab === 'teams' && (
          <button
            onClick={() => { setSearchQuery(''); setIsAddModalOpen(true); }}
            className="flex items-center gap-1.5 bg-ndembo-neon text-ndembo-bg text-sm font-bold px-4 py-2 rounded-xl hover:bg-ndembo-neonDim transition-colors"
          >
            <Plus size={16} />
            Ajouter
          </button>
        )}
      </div>

      {/* Teams tab */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          {favTeams.length === 0 ? (
            <EmptyState
              icon={Star}
              title="Aucune équipe favorite"
              description="Ajoutez vos équipes préférées pour suivre leurs matchs en direct. Vos favoris sont sauvegardés dans votre navigateur."
              action={{ label: 'Ajouter une équipe', onClick: () => { setSearchQuery(''); setIsAddModalOpen(true); } }}
            />
          ) : (
            <>
              {/* Live matches involving favorite teams */}
              {liveForFavTeams.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 bg-ndembo-live rounded-full animate-pulse-live" />
                    <h2 className="text-sm font-semibold text-ndembo-text">
                      En direct maintenant
                    </h2>
                    <span className="text-[10px] text-ndembo-muted">
                      {liveForFavTeams.length} match{liveForFavTeams.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {liveForFavTeams.map(match => (
                      <FavoriteTeamLiveCard key={match.id} match={match} />
                    ))}
                  </div>
                </section>
              )}

              {/* Favorite teams grid */}
              <section>
                <h2 className="text-sm font-semibold text-ndembo-text mb-3">
                  Mes équipes
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {favTeams.map(team => (
                    <div
                      key={team.id}
                      className="bg-ndembo-card border border-ndembo-border rounded-xl p-4 flex items-center gap-3 group hover:border-ndembo-neon/30 transition-all duration-200">
                      {team.logo ? (
                          <img
                            src={team.logo}
                            alt={team.name}
                            className="h-10 w-10 rounded-full object-contain"
                          />
                        ) : (
                          <TeamLogo name={team.name} size="md" />
                        )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ndembo-text truncate group-hover:text-ndembo-neon transition-colors">
                          {team.name}
                        </p>
                        {team.sublabel && (
                          <p className="text-xs text-ndembo-muted truncate flex items-center gap-1">
                            <Trophy size={10} className="flex-shrink-0" />
                            {team.sublabel}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFavorite(team.id)}
                        className="p-2 text-ndembo-muted hover:text-ndembo-live hover:bg-ndembo-cardHover rounded-lg transition-colors flex-shrink-0"
                        aria-label="Retirer des favoris"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      )}

      {/* Add Team modal */}
      {isAddModalOpen && (
        <AddTeamModal
          teams={filteredTeams}
          searchQuery={searchQuery}
          isSearchingTeams={isSearchingTeams}
          teamSearchError={teamSearchError}
          onSearchChange={setSearchQuery}
          isFavorite={isFavorite}
          onAdd={(team) => {
            toggleFavorite({ id: team.id, type: 'team', name: team.name, sublabel: team.competition, logo: team.logo });
            setIsAddModalOpen(false);
          }}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {/* Matches tab */}
      {activeTab === 'matches' && (
        <div className="space-y-3">
          {favMatches.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Aucun match favori"
              description="Cliquez sur l'étoile à côté d'un match pour l'ajouter à vos favoris. Vous pourrez suivre facilement vos matchs préférés."
              action={{ label: 'Parcourir les matchs', onClick: () => navigate('/matches') }}
            />
          ) : (
            <>
              {/* Live favorite matches first */}
              {enrichedMatches
                .filter(({ full }) => full && full.status === 'live')
                .map(({ fav, full }) => (
                  <FavoriteMatchRow
                    key={fav.id}
                    favName={fav.name}
                    favSublabel={fav.sublabel}
                    match={full}
                    onRemove={() => removeFavorite(fav.id)}
                  />
                ))}

              {/* Divider if there are live matches */}
              {enrichedMatches.some(({ full }) => full && full.status === 'live') &&
                enrichedMatches.some(({ full }) => !full || full.status !== 'live') && (
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex-1 h-px bg-ndembo-border/50" />
                    <span className="text-[10px] uppercase tracking-wide text-ndembo-muted">
                      Autres matchs
                    </span>
                    <div className="flex-1 h-px bg-ndembo-border/50" />
                  </div>
                )}

              {/* Non-live favorite matches */}
              {enrichedMatches
                .filter(({ full }) => !full || full.status !== 'live')
                .map(({ fav, full }) => (
                  <FavoriteMatchRow
                    key={fav.id}
                    favName={fav.name}
                    favSublabel={fav.sublabel}
                    match={full}
                    onRemove={() => removeFavorite(fav.id)}
                  />
                ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Sub-components ---------- */


function FavoriteTeamLiveCard({ match }: { match: Match }) {
  return (
    <Link
      to={`/matches/${match.id}`}
      className="block bg-ndembo-card border border-ndembo-live/30 rounded-xl p-3.5 hover:border-ndembo-live/50 transition-all duration-200 group"
    >
      <div className="flex items-center justify-between mb-2.5">
        <CompetitionBadge
          name={match.competition.name}
          country={match.competition.country}
        />
        <LiveIndicator minute={match.minute} />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <TeamLogo
            name={match.homeTeam.name}
            shortName={match.homeTeam.shortName}
            logo={match.homeTeam.logo}
            size="sm"
          />
          <span className="text-sm text-ndembo-text truncate flex-1">
            {match.homeTeam.name}
          </span>
          {match.homeScore !== null && (
            <span className="text-sm font-mono font-bold text-ndembo-text tabular-nums">
              {match.homeScore}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <TeamLogo
            name={match.awayTeam.name}
            shortName={match.awayTeam.shortName}
            logo={match.awayTeam.logo}
            size="sm"
          />
          <span className="text-sm text-ndembo-text truncate flex-1">
            {match.awayTeam.name}
          </span>
          {match.awayScore !== null && (
            <span className="text-sm font-mono font-bold text-ndembo-text tabular-nums">
              {match.awayScore}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}


interface FavoriteMatchRowProps {
  favName: string;
  favSublabel?: string;
  match?: Match;
  onRemove: () => void;
}

function FavoriteMatchRow({ favName, favSublabel, match, onRemove }: FavoriteMatchRowProps) {
  const isLive = match?.status === 'live';
  const isFinished = match?.status === 'finished';
  const isUpcoming = match?.status === 'upcoming';
  const hasScore = match && match.homeScore !== null && match.awayScore !== null;
  const homeWin = hasScore && match!.homeScore! > match!.awayScore!;
  const awayWin = hasScore && match!.awayScore! > match!.homeScore!;

  // If we have full match data, render a rich row
  if (match) {
    return (
      <Link
        to={`/matches/${match.id}`}
        className={`bg-ndembo-card border rounded-xl p-3.5 flex items-center gap-3 group hover:bg-ndembo-cardHover transition-all duration-200 ${
          isLive ? 'border-ndembo-live/30 hover:border-ndembo-live/50' : 'border-ndembo-border hover:border-ndembo-neon/30'
        }`}
      >
        {/* Left: competition badge (hidden on very small screens) */}
        <div className="hidden sm:flex flex-col items-center gap-1 w-16 flex-shrink-0">
          <CompetitionBadge name={match.competition.name} />
        </div>

        {/* Center: teams + score */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <TeamLogo name={match.homeTeam.name} shortName={match.homeTeam.shortName} size="sm" />
            <span
              className={`text-sm truncate flex-1 ${
                homeWin && isFinished ? 'font-semibold text-ndembo-text' : 'text-ndembo-text'
              }`}
            >
              <span className="sm:hidden">{match.homeTeam.name}</span>
              <span className="hidden sm:inline">{match.homeTeam.name}</span>
            </span>
            {hasScore && (
              <span
                className={`text-sm font-mono font-bold tabular-nums ${
                  homeWin && isFinished ? 'text-ndembo-text' : 'text-ndembo-muted'
                }`}
              >
                {match.homeScore}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TeamLogo name={match.awayTeam.name} shortName={match.awayTeam.shortName} size="sm" />
            <span
              className={`text-sm truncate flex-1 ${
                awayWin && isFinished ? 'font-semibold text-ndembo-text' : 'text-ndembo-text'
              }`}
            >
              {match.awayTeam.name}
            </span>
            {hasScore && (
              <span
                className={`text-sm font-mono font-bold tabular-nums ${
                  awayWin && isFinished ? 'text-ndembo-text' : 'text-ndembo-muted'
                }`}
              >
                {match.awayScore}
              </span>
            )}
          </div>
        </div>

        {/* Right: status + remove */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {isLive ? (
            <LiveIndicator minute={match.minute} />
          ) : isUpcoming ? (
            <div className="text-right">
              <p className="text-[11px] font-medium text-ndembo-accent">{formatDate(match.kickoff)}</p>
              <p className="text-[10px] text-ndembo-muted">{formatTime(match.kickoff)}</p>
            </div>
          ) : isFinished ? (
            <span className="text-[10px] text-ndembo-muted uppercase tracking-wide">
              {statusLabel(match.status)}
            </span>
          ) : null}
          <RemoveButton onRemove={onRemove} />
        </div>
      </Link>
    );
  }

  // Fallback: stored favorite data only (match not in current feed)
  return (
    <div className="bg-ndembo-card border border-ndembo-border rounded-xl p-3.5 flex items-center gap-3 group hover:bg-ndembo-cardHover transition-all duration-200">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ndembo-text truncate">{favName}</p>
        {favSublabel && (
          <p className="text-xs text-ndembo-muted truncate flex items-center gap-1">
            <Trophy size={10} className="flex-shrink-0" />
            {favSublabel}
          </p>
        )}
      </div>
      <span className="text-[10px] text-ndembo-dim uppercase tracking-wide hidden sm:inline">
        Hors flux
      </span>
      <RemoveButton onRemove={onRemove} />
    </div>
  );
}

interface TeamPick {
  id: string;
  name: string;
  shortName?: string;
  competition: string;
  logo?: string;    
}


interface AddTeamModalProps {
  teams: TeamPick[];
  searchQuery: string;
  isSearchingTeams: boolean;
  teamSearchError: string;
  onSearchChange: (q: string) => void;
  isFavorite: (id: string) => boolean;
  onAdd: (team: TeamPick) => void;
  onClose: () => void;
}

function AddTeamModal({
  teams,
  searchQuery,
  isSearchingTeams,
  teamSearchError,
  onSearchChange,
  isFavorite,
  onAdd,
  onClose,
}: AddTeamModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-ndembo-card border border-ndembo-border rounded-2xl w-full sm:max-w-lg h-[min(75dvh,560px)] max-h-[calc(100dvh-24px)] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between p-4 border-b border-ndembo-border">
          <h2 className="text-base font-bold text-ndembo-text">Ajouter une équipe</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-ndembo-muted hover:text-ndembo-text hover:bg-ndembo-cardHover rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4 border-b border-ndembo-border">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ndembo-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Rechercher une équipe..."
              autoFocus
              className="w-full bg-ndembo-bg border border-ndembo-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-ndembo-text placeholder:text-ndembo-muted focus:outline-none focus:border-ndembo-neon/50 transition-colors"
            />
          </div>
        </div>

        {/* Team list */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2 flex flex-col">
          {teams.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-4 text-center -translate-y-8">
              {isSearchingTeams ? (
                <>
                  <LoaderCircle
                    size={30}
                    className="text-ndembo-neon mb-3 animate-spin"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-ndembo-muted">Recherche des équipes...</p>
                </>
              ) : teamSearchError ? (
                <>
                  <Search size={28} className="text-ndembo-live mb-3" />
                  <p className="text-sm text-ndembo-live">{teamSearchError}</p>
                </>
              ) : searchQuery.trim().length < 2 ? (
                <>
                  <Search size={28} className="text-ndembo-dim mb-3" />
                  <p className="text-sm text-ndembo-muted">
                    Saisissez au moins 2 caractères pour rechercher une équipe.
                  </p>
                </>
              ) : (
                <>
                  <Search size={28} className="text-ndembo-dim mb-3" />
                  <p className="text-sm text-ndembo-muted">
                    Aucune équipe trouvée pour « {searchQuery} »
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {teams.map(team => {
                const alreadyFav = isFavorite(team.id);
                return (
                  <div
                    key={team.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-ndembo-cardHover transition-colors">               
                    
                   <TeamLogo name={team.name} shortName={team.shortName} logo={team.logo} size="md"/>
                
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ndembo-text truncate">{team.name}</p>
                      <p className="text-xs text-ndembo-muted truncate flex items-center gap-1">
                        <Trophy size={10} className="flex-shrink-0" />
                        {team.competition}
                      </p>
                    </div>
                    {alreadyFav ? (
                      <span className="flex items-center gap-1 text-xs text-ndembo-neon font-medium px-3 py-1.5">
                        <Check size={14} />
                        Ajouté
                      </span>
                    ) : (
                      <button
                        onClick={() => onAdd(team)}
                        className="flex items-center gap-1 bg-ndembo-neon text-ndembo-bg text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-ndembo-neonDim transition-colors flex-shrink-0"
                      >
                        <Plus size={14} />
                        Ajouter
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RemoveButton({ onRemove }: { onRemove: () => void }) {
  return (
    <button
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        onRemove();
      }}
      className="p-2 text-ndembo-muted hover:text-ndembo-live hover:bg-ndembo-cardHover rounded-lg transition-colors flex-shrink-0"
      aria-label="Retirer des favoris"
    >
      <Trash2 size={15} />
    </button>
  );
}
