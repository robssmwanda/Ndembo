import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import type { Match } from '@/types';
import { TeamLogo } from './TeamLogo';
import { CompetitionBadge } from './CompetitionBadge';
import { LiveIndicator } from './LiveIndicator';
import { FavoriteButton } from './FavoriteButton';
import { formatTime, statusLabel } from '@/lib/format';

interface MatchCardProps {
  match: Match;
  compact?: boolean;
}

export function MatchCard({ match, compact = false }: MatchCardProps) {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  const hasScore = match.homeScore !== null && match.awayScore !== null;

  const homeWin = hasScore && match.homeScore! > match.awayScore!;
  const awayWin = hasScore && match.awayScore! > match.homeScore!;

  return (
    <Link
      to={`/matches/${match.id}`}
      className="block bg-ndembo-card border border-ndembo-border rounded-xl p-4 hover:border-ndembo-neon/30 hover:bg-ndembo-cardHover transition-all duration-200 group animate-fade-in"
    >
      {/* Top row: competition + status */}
      <div className="flex items-center justify-between mb-3">
        <CompetitionBadge
          name={match.competition.name}
          country={match.competition.country}
        />

        {isLive ? (
          <LiveIndicator minute={match.minute} />
        ) : (
          <span className="text-[10px] text-ndembo-muted uppercase tracking-wide">
            {isFinished ? statusLabel(match.status) : formatTime(match.kickoff)}
          </span>
        )}
      </div>

      {/* Teams and score */}
      <div className="space-y-2">
        {/* Home team */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0">
            <TeamLogo
              name={match.homeTeam.name}
              shortName={match.homeTeam.shortName}
              logo={match.homeTeam.logo}
              size="sm"
            />
          </div>

          <span
            className={`text-sm flex-1 min-w-0 truncate ${
              homeWin && isFinished
                ? 'font-semibold text-ndembo-text'
                : 'text-ndembo-text'
            }`}
            title={match.homeTeam.name}
          >
            {match.homeTeam.name}
          </span>

          {hasScore && (
            <span
              className={`text-sm font-mono font-bold tabular-nums shrink-0 ${
                homeWin && isFinished
                  ? 'text-ndembo-text'
                  : 'text-ndembo-muted'
              }`}
            >
              {match.homeScore}
            </span>
          )}
        </div>

        {/* Away team */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0">
            <TeamLogo
              name={match.awayTeam.name}
              shortName={match.awayTeam.shortName}
              logo={match.awayTeam.logo}
              size="sm"
            />
          </div>

          <span
            className={`text-sm flex-1 min-w-0 truncate ${
              awayWin && isFinished
                ? 'font-semibold text-ndembo-text'
                : 'text-ndembo-text'
            }`}
            title={match.awayTeam.name}
          >
            {match.awayTeam.name}
          </span>

          {hasScore && (
            <span
              className={`text-sm font-mono font-bold tabular-nums shrink-0 ${
                awayWin && isFinished
                  ? 'text-ndembo-text'
                  : 'text-ndembo-muted'
              }`}
            >
              {match.awayScore}
            </span>
          )}
        </div>
      </div>

      {/* Bottom row: actions */}
      {!compact && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-ndembo-border/50">
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="inline-flex items-center gap-1 text-[10px] text-ndembo-muted">
                <BarChart3 size={12} /> Stats
              </span>
            )}
          </div>

          <FavoriteButton
            id={match.id}
            type="match"
            name={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
            sublabel={match.competition.name}
          />
        </div>
      )}
    </Link>
  );
}
