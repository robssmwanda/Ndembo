import { Star } from 'lucide-react';
import { useFavorites } from '@/lib/favorites';
import type { FavoriteType } from '@/lib/favorites';

interface FavoriteButtonProps {
  id: string;
  type: FavoriteType;
  name: string;
  sublabel?: string;
  size?: 'sm' | 'md';
}

export function FavoriteButton({ id, type, name, sublabel, size = 'sm' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(id);

  const iconSize = size === 'sm' ? 16 : 20;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite({ id, type, name, sublabel });
      }}
      className={`p-1.5 rounded-lg transition-all duration-200 hover:bg-ndembo-cardHover ${
        active ? 'text-ndembo-neon' : 'text-ndembo-muted hover:text-ndembo-text'
      }`}
      aria-label={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <Star
        size={iconSize}
        className={active ? 'fill-ndembo-neon' : ''}
      />
    </button>
  );
}
