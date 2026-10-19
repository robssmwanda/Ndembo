import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-ndembo-sidebar/80 backdrop-blur-md border-b border-ndembo-border h-16 flex items-center px-4 lg:px-6 gap-3">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-ndembo-muted hover:text-ndembo-text"
      >
        <Menu size={22} />
      </button>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ndembo-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher équipes, compétitions, matchs..."
            className="w-full bg-ndembo-card border border-ndembo-border rounded-lg pl-9 pr-4 py-2 text-sm text-ndembo-text placeholder:text-ndembo-muted focus:outline-none focus:border-ndembo-neon/50 transition-colors"
          />
        </div>
      </form>

      <div className="flex-1" />

      {/* Notifications */}
      <button className="relative p-2 text-ndembo-muted hover:text-ndembo-text hover:bg-ndembo-card rounded-lg transition-colors">
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-ndembo-live rounded-full animate-pulse-live" />
      </button>

      {/* User dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 p-1 pr-2 hover:bg-ndembo-card rounded-lg transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ndembo-neon to-ndembo-neonDark flex items-center justify-center text-ndembo-bg font-bold text-sm">
            N
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-ndembo-text leading-none">Ndembo</p>
            <p className="text-[10px] text-ndembo-muted mt-0.5">Account</p>
          </div>
          <ChevronDown size={14} className="text-ndembo-muted" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-ndembo-card border border-ndembo-border rounded-xl shadow-xl py-2 animate-scale-in origin-top-right">
            <button className="w-full text-left px-4 py-2 text-sm text-ndembo-text hover:bg-ndembo-cardHover transition-colors">
              Mon profil
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="w-full text-left px-4 py-2 text-sm text-ndembo-text hover:bg-ndembo-cardHover transition-colors"
            >
              Paramètres
            </button>
            <div className="border-t border-ndembo-border my-1" />
            <button className="w-full text-left px-4 py-2 text-sm text-ndembo-muted hover:bg-ndembo-cardHover transition-colors">
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
