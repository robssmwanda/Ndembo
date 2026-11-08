import { Link } from 'react-router-dom';
import { Star, Trophy, Newspaper } from 'lucide-react';
import { useFavorites } from '@/lib/favorites';
import { CompetitionBadge } from './CompetitionBadge';
import { TeamLogo } from './TeamLogo';
import { EmptyState } from './EmptyState';
import type { Competition } from '@/types';

interface RightSidebarProps {
  competitions?: Competition[];
}

export function RightSidebar({ competitions = [] }: RightSidebarProps) {
  const { getTeams, getMatches } = useFavorites();
  const favTeams = getTeams();
  const favMatches = getMatches();
  const popularComps = competitions.slice(0, 5);

  return (
    <aside className="w-full xl:w-[280px] flex-shrink-0 space-y-4 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hidden hidden xl:block">
      {/* My Favorites */}
      <div className="bg-ndembo-card border border-ndembo-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Star size={14} className="text-ndembo-neon" />
          <h3 className="text-sm font-semibold text-ndembo-text">Mes Favoris</h3>
        </div>
        {favTeams.length === 0 && favMatches.length === 0 ? (
          <p className="text-xs text-ndembo-muted py-3 text-center">
            Ajoutez des équipes et matchs à vos favoris pour les suivre facilement.
          </p>
        ) : (
          <div className="space-y-2">
            {favTeams.slice(0, 4).map(team => (
              <Link key={team.id} to="/favorites" className="flex items-center gap-2 group">
                <TeamLogo name={team.name} logo={team.logo} size="sm"/>
                <span className="text-xs text-ndembo-text truncate group-hover:text-ndembo-neon transition-colors">{team.name}</span>
              </Link>
            ))}
            {favMatches.slice(0, 3).map(match => (
              <Link key={match.id} to={`/matches/${match.id}`} className="block text-xs text-ndembo-muted hover:text-ndembo-neon transition-colors truncate">
                {match.name}
              </Link>
            ))}
          </div>
        )}
        <Link to="/favorites" className="block text-xs text-ndembo-neon mt-3 hover:underline">
          Voir tout →
        </Link>
      </div>

      {/* Popular Competitions */}
      <div className="bg-ndembo-card border border-ndembo-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={14} className="text-ndembo-neon" />
          <h3 className="text-sm font-semibold text-ndembo-text">Compétitions Populaires</h3>
        </div>
        <div className="space-y-2.5">
          {popularComps.map(comp => (
            <Link
              key={comp.id}
              to={`/competitions/${comp.id}`}
              className="flex items-center gap-2 group hover:bg-ndembo-cardHover -mx-2 px-2 py-1 rounded-lg transition-colors"
            >
              <CompetitionBadge name={comp.name} country={comp.country} size="md" />
            </Link>
          ))}
        </div>
      </div>

      {/* News placeholder */}
      <div className="bg-ndembo-card border border-ndembo-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Newspaper size={14} className="text-ndembo-neon" />
          <h3 className="text-sm font-semibold text-ndembo-text">Actualités</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="group cursor-pointer">
              <div className="w-full h-20 bg-gradient-to-br from-ndembo-border/30 to-ndembo-bg rounded-lg mb-2 flex items-center justify-center">
                <Newspaper size={18} className="text-ndembo-dim" />
              </div>
              <p className="text-xs text-ndembo-text leading-tight group-hover:text-ndembo-neon transition-colors">
                Les dernières actualités du football seront disponibles ici prochainement.
              </p>
              <p className="text-[10px] text-ndembo-dim mt-1">Ndembo Editor</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
