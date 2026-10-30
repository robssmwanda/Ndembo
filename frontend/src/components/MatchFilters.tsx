interface MatchFiltersProps {
  tabs: { key: string; label: string; count?: number }[];
  activeTab: string;
  onTabChange: (key: string) => void;
  date?: string;
  onDateChange?: (date: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  competitionFilter?: string;
  competitionOptions?: { id: string; name: string }[];
  onCompetitionChange?: (compId: string) => void;
  onRefresh?: () => void;
}

export function MatchFilters({
  tabs,
  activeTab,
  onTabChange,
  date,
  onDateChange,
  searchQuery,
  onSearchChange,
  competitionFilter,
  competitionOptions,
  onCompetitionChange,
  onRefresh,
}: MatchFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-ndembo-card border border-ndembo-border rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`
              px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200
              flex items-center gap-1.5
              ${activeTab === tab.key
                ? 'bg-ndembo-neon text-ndembo-bg'
                : 'text-ndembo-muted hover:text-ndembo-text'
              }
            `}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1 rounded ${activeTab === tab.key ? 'bg-ndembo-bg/20' : 'bg-ndembo-border/50'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        {onDateChange && (
          <input
            type="date"
            value={date || ''}
             min={new Date().toISOString().split('T')[0]}
             max={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-ndembo-card border border-ndembo-border rounded-lg px-3 py-1.5 text-xs text-ndembo-text focus:outline-none focus:border-ndembo-neon/50"
          />
        )}

        {onSearchChange && (
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher une équipe..."
            className="bg-ndembo-card border border-ndembo-border rounded-lg px-3 py-1.5 text-xs text-ndembo-text placeholder:text-ndembo-muted focus:outline-none focus:border-ndembo-neon/50 w-40"
          />
        )}

        {onCompetitionChange && competitionOptions && (
          <select
            value={competitionFilter || ''}
            onChange={(e) => onCompetitionChange(e.target.value)}
            className="bg-ndembo-card border border-ndembo-border rounded-lg px-3 py-1.5 text-xs text-ndembo-text focus:outline-none focus:border-ndembo-neon/50 cursor-pointer"
          >
            <option value="">Toutes les compétitions</option>
            {competitionOptions.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="ml-auto flex items-center gap-1.5 bg-ndembo-card border border-ndembo-border text-ndembo-muted hover:text-ndembo-text text-xs px-3 py-1.5 rounded-lg transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
            Actualiser
          </button>
        )}
      </div>
    </div>
  );
}
