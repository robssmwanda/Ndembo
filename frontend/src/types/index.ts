export type MatchStatus = 'live' | 'upcoming' | 'finished';

export interface Team {
  id: string;
  name: string;
  logo?: string;
  shortName?: string;
}

export interface Competition {
  id: string;
  name: string;
  logo?: string;
  country?: string;
  countryCode?: string;
  region?: string;
}

export interface Match {
  id: string;
  competition: Competition;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  minute?: string;
  kickoff: string; // ISO date string
  venue?: string;
  events?: MatchEvent[];
  statistics?: MatchStatistics;
  lineups?: Lineups;
}

export interface MatchEvent {
  id: string;
  minute: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution';
  team: 'home' | 'away';
  player: string;
  detail?: string;
}

export interface StatItem {
  label: string;
  home: number | string;
  away: number | string;
}

export interface MatchStatistics {
  possession?: StatItem;
  shots?: StatItem;
  shotsOnTarget?: StatItem;
  corners?: StatItem;
  fouls?: StatItem;
  offsides?: StatItem;
  items: StatItem[];
}

export interface Lineups {
  home: {
    formation: string;
    players: LineupPlayer[];
  };
  away: {
    formation: string;
    players: LineupPlayer[];
  };
}

export interface LineupPlayer {
  number: number;
  name: string;
  position: string;
}

export interface StandingRow {
  position: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: ('W' | 'D' | 'L')[];
}

export interface Standings {
  competition: Competition;
  season?: string;
  table: StandingRow[];
}

export interface MatchesResponse {
  live: Match[];
  upcoming: Match[];
  finished: Match[];
}

export async function fetchCompetitionsByCountry(
  countryCode: string,
  signal?: AbortSignal
): Promise<ApiResult<Competition[]>> {
  if (!API_BASE_URL) {
    return {
      data: getMockCompetitions(),
      error: null,
      isMockData: true,
    };
  }

  return fetchWithFallback(
    `${API_BASE_URL}/api/competitions?country=${countryCode}`,
    () => [],
    signal,
  );
}

export async function fetchCountries(
  signal?: AbortSignal
): Promise<ApiResult<{ code: string; name: string }[]>> {
  if (!API_BASE_URL) {
    return {
      data: [],
      error: null,
      isMockData: true,
    };
  }

  return fetchWithFallback(
    `${API_BASE_URL}/api/competitions/countries`,
    () => [],
    signal,
  );
}

export interface TeamDetails extends Team {
  country?: string | null;
  city?: string | null;
}

export interface TeamFixturesResponse {
  team: TeamDetails;
  fixtures: Match[];
}