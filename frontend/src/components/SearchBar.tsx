import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({ placeholder = 'Rechercher...', className = '' }: SearchBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ndembo-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-ndembo-card border border-ndembo-border rounded-lg pl-9 pr-4 py-2 text-sm text-ndembo-text placeholder:text-ndembo-muted focus:outline-none focus:border-ndembo-neon/50 transition-colors"
        />
      </div>
    </form>
  );
}
