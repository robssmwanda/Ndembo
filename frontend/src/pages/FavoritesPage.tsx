import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar, Trophy, Trash2 } from 'lucide-react';
import { useFavorites } from '@/lib/favorites';
import { TeamLogo } from '@/components/TeamLogo';
import { EmptyState } from '@/components/EmptyState';

type TabKey = 'teams' | 'matches';

export function FavoritesPage() {
  const { getTeams, getMatches, removeFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState<TabKey>('teams');
  const favTeams = getTeams();
  const favMatches = getMatches();

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'teams', label: 'Équipes', count: favTeams.length },
    { key: 'matches', label: 'Matchs', count: favMatches.length },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-ndembo-text">Favoris</h1>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-ndembo-card border border-ndembo-border rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
              activeTab === tab.key ? 'bg-ndembo-neon text-ndembo-bg' : 'text-ndembo-muted hover:text-ndembo-text'
            }`}
          >
            {tab.label}
            <span className={`text-[10px] px-1 rounded ${activeTab === tab.key ? 'bg-ndembo-bg/20' : 'bg-ndembo-border/50'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Teams tab */}
      {activeTab === 'teams' && (
        favTeams.length === 0 ? (
          <EmptyState
            icon={Star}
            title="Aucune équipe favorite"
            description="Cliquez sur l'étoile à côté d'une équipe pour l'ajouter à vos favoris. Vos favoris sont sauvegardés dans votre navigateur."
            action={{ label: 'Parcourir les matchs', onClick: () => window.location.href = '/matches' }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {favTeams.map(team => (
              <div key={team.id} className="bg-ndembo-card border border-ndembo-border rounded-xl p-4 flex items-center gap-3 group hover:border-ndembo-neon/30 transition-colors">
                <TeamLogo name={team.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ndembo-text truncate">{team.name}</p>
                  {team.sublabel && <p className="text-xs text-ndembo-muted truncate">{team.sublabel}</p>}
                </div>
                <button
                  onClick={() => removeFavorite(team.id)}
                  className="p-1.5 text-ndembo-muted hover:text-ndembo-live hover:bg-ndembo-cardHover rounded-lg transition-colors"
                  aria-label="Retirer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Matches tab */}
      {activeTab === 'matches' && (
        favMatches.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Aucun match favori"
            description="Cliquez sur l'étoile à côté d'un match pour l'ajouter à vos favoris. Vous pourrez suivre facilement vos matchs préférés."
            action={{ label: 'Parcourir les matchs', onClick: () => window.location.href = '/matches' }}
          />
        ) : (
          <div className="space-y-2">
            {favMatches.map(match => (
              <Link
                key={match.id}
                to={`/matches/${match.id}`}
                className="bg-ndembo-card border border-ndembo-border rounded-xl p-3 flex items-center gap-3 group hover:border-ndembo-neon/30 transition-colors"
              >
                <Trophy size={16} className="text-ndembo-muted flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ndembo-text truncate group-hover:text-ndembo-neon transition-colors">{match.name}</p>
                  {match.sublabel && <p className="text-xs text-ndembo-muted truncate">{match.sublabel}</p>}
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); removeFavorite(match.id); }}
                  className="p-1.5 text-ndembo-muted hover:text-ndembo-live hover:bg-ndembo-cardHover rounded-lg transition-colors"
                  aria-label="Retirer"
                >
                  <Trash2 size={14} />
                </button>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}
