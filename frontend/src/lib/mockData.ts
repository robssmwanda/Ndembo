import type { Match, MatchesResponse, Competition, Team, MatchStatus, Standings, StandingRow, MatchEvent, StatItem } from '@/types';

const competitions: Competition[] = [
  { id: 'pl', name: 'Premier League', country: 'England', region: 'Europe' },
  { id: 'liga', name: 'La Liga', country: 'Spain', region: 'Europe' },
  { id: 'seriea', name: 'Serie A', country: 'Italy', region: 'Europe' },
  { id: 'bundesliga', name: 'Bundesliga', country: 'Germany', region: 'Europe' },
  { id: 'ligue1', name: 'Ligue 1', country: 'France', region: 'Europe' },
  { id: 'ucl', name: 'UEFA Champions League', country: 'Europe', region: 'Europe' },
  { id: 'uel', name: 'UEFA Europa League', country: 'Europe', region: 'Europe' },
  { id: 'caf', name: 'CAF Champions League', country: 'Africa', region: 'Africa' },
  { id: 'mls', name: 'Major League Soccer', country: 'USA', region: 'Americas' },
  { id: 'afcon', name: 'Africa Cup of Nations', country: 'Africa', region: 'Africa' },
  { id: 'jleague', name: 'J-League', country: 'Japan', region: 'Asia' },
  { id: 'saudi', name: 'Saudi Pro League', country: 'Saudi Arabia', region: 'Asia' },
];

const teamNames: Record<string, string[]> = {
  pl: ['Arsenal', 'Manchester City', 'Liverpool', 'Chelsea', 'Tottenham', 'Manchester United'],
  liga: ['Real Madrid', 'Barcelona', 'Atlético Madrid', 'Sevilla', 'Valencia', 'Real Sociedad'],
  seriea: ['Inter', 'AC Milan', 'Juventus', 'Napoli', 'Roma', 'Lazio'],
  bundesliga: ['Bayern Munich', 'Borussia Dortmund', 'RB Leipzig', 'Bayer Leverkusen', 'Wolfsburg', 'Eintracht Frankfurt'],
  ligue1: ['PSG', 'Marseille', 'Monaco', 'Lyon', 'Lille', 'Nice'],
  ucl: ['Real Madrid', 'Manchester City', 'Bayern Munich', 'PSG', 'Inter', 'Barcelona', 'Arsenal', 'Borussia Dortmund'],
  uel: ['Roma', 'Sevilla', 'Leverkusen', 'Atalanta', 'Marseille', 'Brighton'],
  caf: ['Al Ahly', 'Wydad', 'Mamelodi Sundowns', 'Esperance', 'Zamalek', 'TP Mazembe'],
  mls: ['Inter Miami', 'LA Galaxy', 'NYCFC', 'Atlanta United', 'Seattle Sounders', 'Portland Timbers'],
  afcon: ['Nigeria', 'Senegal', 'Morocco', 'Egypt', 'Cameroon', 'Algeria'],
  jleague: ['Yokohama F. Marinos', 'Vissel Kobe', 'Sanfrecce Hiroshima', 'Kashima Antlers', 'Urawa Reds', 'FC Tokyo'],
  saudi: ['Al Hilal', 'Al Nassr', 'Al Ittihad', 'Al Ahli', 'Al Shabab', 'Al Taawon'],
};

function shortName(name: string): string {
  if (name.length <= 4) return name.toUpperCase();
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 3).toUpperCase();
}

function team(id: string, name: string): Team {
  return { id, name, shortName: shortName(name) };
}

function teamsForComp(compId: string): Team[] {
  const names = teamNames[compId] || ['Team A', 'Team B'];
  return names.map((n, i) => team(`${compId}-t${i}`, n));
}

function randomMinute(): string {
  const m = Math.floor(Math.random() * 90) + 1;
  return `${m}'`;
}

function generateEvents(home: Team, away: Team, homeScore: number, awayScore: number): MatchEvent[] {
  const events: MatchEvent[] = [];
  let goalCount = 0;
  const totalGoals = homeScore + awayScore;
  const teams: [Team, Team] = [home, away];
  let homeGoals = 0;

  for (let i = 0; i < totalGoals; i++) {
    const isHome = homeGoals < homeScore ? Math.random() > 0.3 : false;
    if (isHome) homeGoals++;
    const t = isHome ? teams[0] : teams[1];
    const minute = Math.floor(Math.random() * 90) + 1;
    events.push({
      id: `ev-${i}-${t.id}`,
      minute: `${minute}'`,
      type: 'goal',
      team: isHome ? 'home' : 'away',
      player: `${t.name} FC`,
      detail: 'Goal',
    });
    goalCount++;
  }

  // Add some cards
  const cardCount = Math.floor(Math.random() * 4);
  for (let i = 0; i < cardCount; i++) {
    const isHome = Math.random() > 0.5;
    const t = isHome ? teams[0] : teams[1];
    const minute = Math.floor(Math.random() * 90) + 1;
    events.push({
      id: `ev-card-${i}-${t.id}`,
      minute: `${minute}'`,
      type: Math.random() > 0.8 ? 'red_card' : 'yellow_card',
      team: isHome ? 'home' : 'away',
      player: `${t.name} MF`,
      detail: 'Foul',
    });
  }

  return events.sort((a, b) => parseInt(a.minute) - parseInt(b.minute));
}

function generateStats(homeScore: number, awayScore: number): StatItem[] {
  const possessionHome = 35 + Math.floor(Math.random() * 30);
  const items: StatItem[] = [
    { label: 'Possession', home: `${possessionHome}%`, away: `${100 - possessionHome}%` },
    { label: 'Shots', home: Math.floor(Math.random() * 15) + 3, away: Math.floor(Math.random() * 15) + 3 },
    { label: 'Shots on Target', home: Math.floor(Math.random() * 8) + 1, away: Math.floor(Math.random() * 8) + 1 },
    { label: 'Corners', home: Math.floor(Math.random() * 10), away: Math.floor(Math.random() * 10) },
    { label: 'Fouls', home: Math.floor(Math.random() * 18) + 2, away: Math.floor(Math.random() * 18) + 2 },
    { label: 'Offsides', home: Math.floor(Math.random() * 5), away: Math.floor(Math.random() * 5) },
    { label: 'Yellow Cards', home: Math.floor(Math.random() * 4), away: Math.floor(Math.random() * 4) },
  ];
  return items;
}

function generateMatches(): Match[] {
  const matches: Match[] = [];
  const now = new Date();

  for (const comp of competitions) {
    const teams = teamsForComp(comp.id);
    const matchCount = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < matchCount; i++) {
      const home = teams[Math.floor(Math.random() * teams.length)];
      let away = teams[Math.floor(Math.random() * teams.length)];
      while (away.id === home.id) {
        away = teams[Math.floor(Math.random() * teams.length)];
      }

      const statusRoll = Math.random();
      let status: MatchStatus;
      if (statusRoll < 0.25) status = 'live';
      else if (statusRoll < 0.55) status = 'finished';
      else status = 'upcoming';

      let homeScore: number | null = null;
      let awayScore: number | null = null;
      let minute: string | undefined;
      let kickoff: string;

      if (status === 'live') {
        homeScore = Math.floor(Math.random() * 4);
        awayScore = Math.floor(Math.random() * 4);
        minute = randomMinute();
        kickoff = new Date(now.getTime() - Math.random() * 90 * 60000).toISOString();
      } else if (status === 'finished') {
        homeScore = Math.floor(Math.random() * 4);
        awayScore = Math.floor(Math.random() * 4);
        kickoff = new Date(now.getTime() - (Math.random() * 7 + 1) * 86400000).toISOString();
      } else {
        kickoff = new Date(now.getTime() + (Math.random() * 7 + 0.2) * 86400000).toISOString();
      }

      const match: Match = {
        id: `m-${comp.id}-${i}`,
        competition: comp,
        homeTeam: home,
        awayTeam: away,
        homeScore,
        awayScore,
        status,
        minute,
        kickoff,
        events: status === 'finished' || status === 'live' ? generateEvents(home, away, homeScore || 0, awayScore || 0) : undefined,
        statistics: status === 'finished' || status === 'live' ? { items: generateStats(homeScore || 0, awayScore || 0) } : undefined,
      };
      matches.push(match);
    }
  }

  return matches;
}

const cachedMatches: Match[] = generateMatches();

export function getMockMatches(): MatchesResponse {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 86400000;

  const live = cachedMatches.filter(m => m.status === 'live');
  const upcoming = cachedMatches
    .filter(m => m.status === 'upcoming')
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
  const finished = cachedMatches
    .filter(m => m.status === 'finished')
    .sort((a, b) => new Date(b.kickoff).getTime() - new Date(a.kickoff).getTime());

  return { live, upcoming, finished };
}

export function getMockMatchById(id: string): Match | undefined {
  return cachedMatches.find(m => m.id === id);
}

export function getMockCompetitions(): Competition[] {
  return competitions;
}

export function getMockStandings(compId: string): Standings | undefined {
  const comp = competitions.find(c => c.id === compId);
  if (!comp) return undefined;

  const teams = teamsForComp(compId);
  const table: StandingRow[] = teams.map((t, i) => {
    const played = 20 + Math.floor(Math.random() * 10);
    const won = Math.floor(Math.random() * played);
    const drawn = Math.floor(Math.random() * (played - won));
    const lost = played - won - drawn;
    const goalsFor = won * 2 + drawn + Math.floor(Math.random() * 20);
    const goalsAgainst = lost * 2 + drawn + Math.floor(Math.random() * 15);
    const points = won * 3 + drawn;
    const form: ('W' | 'D' | 'L')[] = Array.from({ length: 5 }, () => {
      const r = Math.random();
      if (r < 0.5) return 'W';
      if (r < 0.75) return 'D';
      return 'L';
    });

    return {
      position: i + 1,
      team: t,
      played,
      won,
      drawn,
      lost,
      goalsFor,
      goalsAgainst,
      goalDifference: goalsFor - goalsAgainst,
      points,
      form,
    };
  }).sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference)
    .map((row, i) => ({ ...row, position: i + 1 }));

  return { competition: comp, season: '2025/2026', table };
}
