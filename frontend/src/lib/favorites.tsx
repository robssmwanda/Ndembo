import { saveFavoritesDB, loadFavoritesDB,} from '@/lib/favoritesDB';
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type FavoriteType = 'team' | 'match';

export interface FavoriteItem {
  id: string;
  type: FavoriteType;
  name: string;
  sublabel?: string;
  logo?: string;
  addedAt: number;
}

interface FavoritesContextValue {
  favorites: FavoriteItem[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: Omit<FavoriteItem, 'addedAt'>) => void;
  removeFavorite: (id: string) => void;
  getTeams: () => FavoriteItem[];
  getMatches: () => FavoriteItem[];
}

const STORAGE_KEY = 'ndembo-favorites';

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

    useEffect(() => {
    let mounted = true;

    async function loadFavorites() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored) {
          const localFavorites = JSON.parse(stored) as FavoriteItem[];

          if (mounted) {
            setFavorites(localFavorites);
          }

          await saveFavoritesDB(localFavorites);
          return;
        }

        const indexedFavorites = await loadFavoritesDB();

        if (!mounted) return;

        setFavorites(indexedFavorites);

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(indexedFavorites)
        );
      } catch (error) {
        console.error('Erreur chargement favoris:', error);
      }
    }

    loadFavorites();

    return () => {
      mounted = false;
    };
  }, []);


  const isFavorite = useCallback((id: string) => favorites.some(f => f.id === id), [favorites]);

    const toggleFavorite = useCallback(
      (item: Omit<FavoriteItem, 'addedAt'>) => {
        setFavorites(prev => {
          const existing = prev.find(f => f.id === item.id);

          const next = existing
            ? prev.filter(f => f.id !== item.id)
            : [...prev, { ...item, addedAt: Date.now() }];

          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch (error) {
            console.error('Erreur LocalStorage:', error);
          }

          void saveFavoritesDB(next).catch(error => {
            console.error('Erreur IndexedDB:', error);
          });

          return next;
        });
      },
      []
    );

    const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = prev.filter(f => f.id !== id);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (error) {
        console.error('Erreur LocalStorage:', error);
      }

      void saveFavoritesDB(next).catch(error => {
        console.error('Erreur IndexedDB:', error);
      });

      return next;
    });
  }, []);

  const getTeams = useCallback(() => favorites.filter(f => f.type === 'team'), [favorites]);
  const getMatches = useCallback(() => favorites.filter(f => f.type === 'match'), [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, removeFavorite, getTeams, getMatches }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
