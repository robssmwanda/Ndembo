import type { Match } from '@/types';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { TeamLogo } from './TeamLogo';
import { CompetitionBadge } from './CompetitionBadge';
import { LiveIndicator } from './LiveIndicator';
import { FavoriteButton } from './FavoriteButton';
import { formatTime, statusLabel } from '@/lib/format';

interface MatchListProps {
  matches: Match[];
  showReminder?: boolean;
}

export function MatchList({ matches, showReminder = false }: MatchListProps) {
  if (matches.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-ndembo-border bg-ndembo-card">
      <table className="w-full">
        <tbody>
          {matches.map((match, idx) => (
            <tr
              key={match.id}
              className={`
                border-b border-ndembo-border/50 last:border-0
                hover:bg-ndembo-cardHover transition-colors
                ${idx % 2 === 1 ? 'bg-ndembo-bg/30' : ''}
              `}
            >
              <td className="py-3 px-3 w-16">
                {match.status === 'live' ? (
                  <LiveIndicator minute={match.minute} />
                ) : (
                  <span className="text-xs font-mono text-ndembo-muted tabular-nums">
                    {formatTime(match.kickoff)}
                  </span>
                )}
              </td>
              <td className="py-3 px-3 hidden sm:table-cell w-40">
                <CompetitionBadge name={match.competition.name} />
              </td>
              <td className="py-3 px-3">
                <Link to={`/matches/${match.id}`} className="flex items-center gap-2 group">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <TeamLogo name={match.homeTeam.name} shortName={match.homeTeam.shortName} size="sm" />
                    <span className="text-sm text-ndembo-text truncate group-hover:text-ndembo-neon transition-colors">
                      {match.homeTeam.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2">
                    {match.homeScore !== null && (
                      <span className="text-sm font-mono font-bold tabular-nums text-ndembo-text">{match.homeScore}</span>
                    )}
                    <span className="text-xs text-ndembo-dim">-</span>
                    {match.awayScore !== null && (
                      <span className="text-sm font-mono font-bold tabular-nums text-ndembo-text">{match.awayScore}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    <span className="text-sm text-ndembo-text truncate group-hover:text-ndembo-neon transition-colors">
                      {match.awayTeam.name}
                    </span>
                    <TeamLogo name={match.awayTeam.name} shortName={match.awayTeam.shortName} size="sm" />
                  </div>
                </Link>
              </td>
              <td className="py-3 px-3 hidden md:table-cell w-20">
                <span className="text-[10px] text-ndembo-muted uppercase">{statusLabel(match.status)}</span>
              </td>
              <td className="py-3 px-3 w-20">
                <div className="flex items-center gap-1 justify-end">
                  {showReminder && match.status === 'upcoming' && (
                    <button
                      className="p-1.5 text-ndembo-muted hover:text-ndembo-neon hover:bg-ndembo-cardHover rounded-lg transition-colors"
                      aria-label="Set reminder"
                    >
                      <Bell size={14} />
                    </button>
                  )}
                  <FavoriteButton
                    id={match.id}
                    type="match"
                    name={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
                    sublabel={match.competition.name}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
