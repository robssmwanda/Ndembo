import type { StandingRow } from '@/types';
import { TeamLogo } from './TeamLogo';
import { Link } from 'react-router-dom';

interface StandingsTableProps {
  rows: StandingRow[];
  compact?: boolean;
}

export function StandingsTable({ rows, compact = false }: StandingsTableProps) {
  return (
    <div className="overflow-x-auto bg-ndembo-card border border-ndembo-border rounded-xl">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ndembo-border text-ndembo-muted text-[10px] uppercase tracking-wide">
            <th className="py-2.5 px-2 text-center w-8">#</th>
            <th className="py-2.5 px-3 text-left">Team</th>
            <th className="py-2.5 px-2 text-center w-8">P</th>
            {!compact && (
              <>
                <th className="py-2.5 px-2 text-center w-8 hidden sm:table-cell">W</th>
                <th className="py-2.5 px-2 text-center w-8 hidden sm:table-cell">D</th>
                <th className="py-2.5 px-2 text-center w-8 hidden sm:table-cell">L</th>
                <th className="py-2.5 px-2 text-center w-10 hidden md:table-cell">GF</th>
                <th className="py-2.5 px-2 text-center w-10 hidden md:table-cell">GA</th>
              </>
            )}
            <th className="py-2.5 px-2 text-center w-10">GD</th>
            <th className="py-2.5 px-2 text-center w-10 font-bold text-ndembo-text">PTS</th>
            {!compact && (
              <th className="py-2.5 px-2 text-center hidden lg:table-cell w-24">Form</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isUCL = row.position <= 4;
            const isRelief = row.position >= rows.length - 3;
            return (
              <tr
                key={row.team.id}
                className="border-b border-ndembo-border/40 last:border-0 hover:bg-ndembo-cardHover transition-colors"
              >
                <td className="py-2.5 px-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span
                      className={`w-1 h-4 rounded-full ${isUCL ? 'bg-ndembo-neon' : isRelief ? 'bg-ndembo-live' : 'bg-transparent'}`}
                    />
                    <span className="text-ndembo-muted font-mono text-xs">{row.position}</span>
                  </div>
                </td>
                <td className="py-2.5 px-3">
                  <Link to={`/teams/${row.team.id}`} className="flex items-center gap-2 group">
                    <TeamLogo name={row.team.name} shortName={row.team.shortName} logo={row.team.logo} size="sm"/>
                    <span className="text-ndembo-text truncate group-hover:text-ndembo-neon transition-colors hidden sm:inline">
                      {row.team.name}
                    </span>
                    <span className="text-ndembo-text truncate group-hover:text-ndembo-neon transition-colors sm:hidden">
                      {row.team.shortName}
                    </span>
                  </Link>
                </td>
                <td className="py-2.5 px-2 text-center text-ndembo-muted font-mono text-xs">{row.played}</td>
                {!compact && (
                  <>
                    <td className="py-2.5 px-2 text-center text-ndembo-muted font-mono text-xs hidden sm:table-cell">{row.won}</td>
                    <td className="py-2.5 px-2 text-center text-ndembo-muted font-mono text-xs hidden sm:table-cell">{row.drawn}</td>
                    <td className="py-2.5 px-2 text-center text-ndembo-muted font-mono text-xs hidden sm:table-cell">{row.lost}</td>
                    <td className="py-2.5 px-2 text-center text-ndembo-muted font-mono text-xs hidden md:table-cell">{row.goalsFor}</td>
                    <td className="py-2.5 px-2 text-center text-ndembo-muted font-mono text-xs hidden md:table-cell">{row.goalsAgainst}</td>
                  </>
                )}
                <td className="py-2.5 px-2 text-center font-mono text-xs">
                  <span className={row.goalDifference > 0 ? 'text-ndembo-neon' : row.goalDifference < 0 ? 'text-ndembo-live' : 'text-ndembo-muted'}>
                    {row.goalDifference > 0 ? '+' : ''}{row.goalDifference}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-center font-bold text-ndembo-text font-mono">{row.points}</td>
                {!compact && row.form && (
                  <td className="py-2.5 px-2 hidden lg:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      {row.form.map((f, i) => (
                        <span
                          key={i}
                          className={`w-4 h-4 rounded text-[8px] flex items-center justify-center font-bold ${
                            f === 'W' ? 'bg-ndembo-neon/20 text-ndembo-neon' :
                            f === 'D' ? 'bg-ndembo-muted/20 text-ndembo-muted' :
                            'bg-ndembo-live/20 text-ndembo-live'
                          }`}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {!compact && (
        <div className="flex items-center gap-4 px-4 py-2 border-t border-ndembo-border text-[10px] text-ndembo-muted">
          <span className="flex items-center gap-1.5"><span className="w-1 h-3 bg-ndembo-neon rounded-full" /> Ligue des Champions</span>
          <span className="flex items-center gap-1.5"><span className="w-1 h-3 bg-ndembo-live rounded-full" /> Relégation</span>
        </div>
      )}
    </div>
  );
}
