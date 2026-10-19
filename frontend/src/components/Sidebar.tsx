import { Link, useLocation } from 'react-router-dom';
import { Home, Trophy, Calendar, Star, BarChart3, Search, Settings, X } from 'lucide-react';
import { useSettings } from '@/lib/settings';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/', label: 'Home', labelFr: 'Accueil', icon: Home },
  { path: '/matches', label: 'Matches', labelFr: 'Matchs', icon: Calendar },
  { path: '/competitions', label: 'Competitions', labelFr: 'Compétitions', icon: Trophy },
  { path: '/standings', label: 'Standings', labelFr: 'Classements', icon: BarChart3 },
  { path: '/favorites', label: 'Favorites', labelFr: 'Favoris', icon: Star },
  { path: '/statistics', label: 'Statistics', labelFr: 'Statistiques', icon: BarChart3 },
  { path: '/search', label: 'Search', labelFr: 'Recherche', icon: Search },
  { path: '/settings', label: 'Settings', labelFr: 'Paramètres', icon: Settings },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const { settings } = useSettings();
  const isFr = settings.language === 'fr';

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50
          w-[250px] h-screen flex-shrink-0
          bg-ndembo-sidebar border-r border-ndembo-border
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-ndembo-border">
          <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-9 h-9">
                <circle cx="20" cy="20" r="18" fill="none" stroke="#A3FF4F" strokeWidth="2" />
                <path d="M20 8 L24 14 L22 21 L18 21 L16 14 Z" fill="#A3FF4F" opacity="0.9" />
                <path d="M20 32 L24 26 L22 21 L18 21 L16 26 Z" fill="#A3FF4F" opacity="0.5" />
                <circle cx="20" cy="20" r="2.5" fill="#07131A" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-ndembo-text leading-none">NDEMBO</h1>
              <p className="text-[9px] tracking-[0.15em] text-ndembo-muted uppercase mt-0.5">Football in Real Time</p>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden text-ndembo-muted hover:text-ndembo-text">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${isActive
                        ? 'bg-ndembo-neon text-ndembo-bg neon-glow-sm'
                        : 'text-ndembo-muted hover:text-ndembo-text hover:bg-ndembo-card'
                      }
                    `}
                  >
                    <Icon size={18} className={isActive ? 'text-ndembo-bg' : ''} />
                    {isFr ? item.labelFr : item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom promo panel */}
        <div className="px-3 pb-4">
          <div className="bg-ndembo-card border border-ndembo-border rounded-xl p-4 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-ndembo-neon/10 rounded-full blur-xl" />
            <p className="text-xs text-ndembo-muted mb-1">Ndembo Pro</p>
            <p className="text-sm font-semibold text-ndembo-text mb-2 leading-tight">
              {isFr ? 'Notifications illimitées et statistiques avancées' : 'Unlimited alerts & advanced stats'}
            </p>
            <button className="w-full bg-ndembo-neon text-ndembo-bg text-xs font-bold py-2 rounded-lg hover:bg-ndembo-neonDim transition-colors">
              {isFr ? "S'abonner" : 'Subscribe'}
            </button>
          </div>

          <div className="flex items-center justify-between mt-3 px-1">
            <span className="text-xs text-ndembo-muted">
              {settings.theme === 'dark' ? (isFr ? 'Sombre' : 'Dark') : (isFr ? 'Clair' : 'Light')}
            </span>
            <button
              onClick={() => { }}
              className="relative w-10 h-5 bg-ndembo-border rounded-full transition-colors"
            >
              <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-ndembo-neon rounded-full transition-transform" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
