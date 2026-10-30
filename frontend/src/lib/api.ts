import type { MatchesResponse, Match, Competition, Standings, TeamDetails } from '@/types';
import { getMockMatches, getMockMatchById, getMockCompetitions, getMockStandings } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

type FetchState = 'loading' | 'success' | 'error';

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
  isMockData: boolean;
}

async function fetchWithFallback<T>(
  url: string,
  mockFn: () => T,
  signal?: AbortSignal,
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      signal,
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    return { data, error: null, isMockData: false };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    // Fallback to mock data
    const data = mockFn();
    return { data, error: null, isMockData: true };
  }
}

export async function fetchMatches(
  signal?: AbortSignal
): Promise<ApiResult<MatchesResponse>> {
  if (!API_BASE_URL) {
    return {
      data: getMockMatches(),
      error: null,
      isMockData: true,
    };
  }

  try {
    const [liveResponse, upcomingResponse, finishedResponse] =
      await Promise.all([
        fetch(`${API_BASE_URL}/api/live`, {
          signal,
          headers: {
            "Content-Type": "application/json",
          },
        }),

        fetch(`${API_BASE_URL}/api/upcoming`, {
          signal,
          headers: {
            "Content-Type": "application/json",
          },
        }),

        fetch(`${API_BASE_URL}/api/finished`, {
          signal,
          headers: {
            "Content-Type": "application/json",
          },
        }),
      ]);

    if (!liveResponse.ok) {
      throw new Error(`Live API returned ${liveResponse.status}`);
    }

    if (!upcomingResponse.ok) {
      throw new Error(
        `Upcoming API returned ${upcomingResponse.status}`
      );
    }

    if (!finishedResponse.ok) {
      throw new Error(
        `Finished API returned ${finishedResponse.status}`
      );
    }

    const live = await liveResponse.json();
    const upcoming = await upcomingResponse.json();
    const finished = await finishedResponse.json();

    return {
      data: {
        live,
        upcoming,
        finished,
      },
      error: null,
      isMockData: false,
    };

  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }

    console.error("Erreur lors de la récupération des matchs :", err);

    return {
      data: null,
      error:
        err instanceof Error
          ? err.message
          : "Impossible de récupérer les matchs.",
      isMockData: false,
    };
  }
}

export async function fetchMatchesByDate(
  date: string,
  signal?: AbortSignal,
): Promise<ApiResult<Match[]>> {
  if (!API_BASE_URL) {
    return {
      data: [],
      error: 'Backend non connecté.',
      isMockData: false,
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/matches?date=${encodeURIComponent(date)}`,
      {
        signal,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Date API returned ${response.status}`,
      );
    }

    const data = await response.json();

    return {
      data: Array.isArray(data) ? data : [],
      error: null,
      isMockData: false,
    };
  } catch (err) {
    if (
      err instanceof DOMException &&
      err.name === 'AbortError'
    ) {
      throw err;
    }

    console.error(
      'Erreur lors de la récupération des matchs par date :',
      err,
    );

    return {
      data: null,
      error:
        err instanceof Error
          ? err.message
          : 'Impossible de récupérer les matchs de cette date.',
      isMockData: false,
    };
  }
}

export async function fetchPopularCompetitions(
  signal?: AbortSignal
): Promise<ApiResult<Competition[]>> {
  if (!API_BASE_URL) {
    return {
      data: getMockCompetitions(),
      error: null,
      isMockData: true,
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/competitions/popular`,
      {
        signal,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Popular competitions API returned ${response.status}`
      );
    }

    const result = await response.json();

    const countries = Array.isArray(result.data)
      ? result.data
      : [];

     console.log("🌍 PAYS FRONTEND :", {
      count: countries.length,
      first: countries[0],
    });

      return {
      data: countries,
      error: null,
      isMockData: false,
    };

  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }

    console.error(
      "Erreur lors de la récupération des compétitions populaires :",
      err
    );

    return {
      data: null,
      error:
        err instanceof Error
          ? err.message
          : "Impossible de récupérer les compétitions populaires.",
      isMockData: false,
    };
  }
}


export async function fetchCompetitionById(
  id: string,
  signal?: AbortSignal
): Promise<ApiResult<Competition | undefined>> {
  if (!API_BASE_URL) {
    const competition = getMockCompetitions().find(
      (competition) => competition.id === id
    );

    return {
      data: competition,
      error: null,
      isMockData: true,
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/competitions/${id}`,
      {
        signal,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Competition API returned ${response.status}`
      );
    }

    const result = await response.json();

    const competition = result.response?.[0]
      ? {
          ...result.response[0].league,
          country: result.response[0].country?.name ?? "",
          countryCode:
            result.response[0].country?.code?.trim().toUpperCase() ?? "",
        }
      : undefined;

    return {
      data: competition,
      error: null,
      isMockData: false,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }

    console.error(
      "Erreur lors de la récupération de la compétition :",
      err
    );

    return {
      data: null,
      error:
        err instanceof Error
          ? err.message
          : "Impossible de récupérer la compétition.",
      isMockData: false,
    };
  }
}

export async function fetchCountries(
  signal?: AbortSignal
): Promise<ApiResult<any[]>> {
  if (!API_BASE_URL) {
    return {
      data: [],
      error: null,
      isMockData: true,
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/competitions/countries`,
      {
        signal,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Countries API returned ${response.status}`
      );
    }

    const result = await response.json();

    const competitions = (result.data ?? []).map((competition: any) => ({
      ...competition,
      country: competition.country?.name ?? '',
      countryCode: competition.country?.code?.trim().toUpperCase() ?? '',
    }));

    return {
      data: competitions,
      error: null,
      isMockData: false,
    };



  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }

    console.error(
      "Erreur lors de la récupération des pays :",
      err
    );

    return {
      data: null,
      error:
        err instanceof Error
          ? err.message
          : "Impossible de récupérer les pays.",
      isMockData: false,
    };
  }
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

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/competitions?country=${encodeURIComponent(countryCode)}`,
      {
        signal,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Country competitions API returned ${response.status}`
      );
    }

    const result = await response.json();

    console.log("🌍 COMPÉTITIONS PAYS FRONTEND :", {
      country: countryCode,
      results: result.results,
      responseLength: result.response?.length ?? 0,
    });

    const competitions: Competition[] = (result.response ?? []).map(
      (item: any) => ({
        ...item.league,
        country: item.country?.name ?? "",
        countryCode: item.country?.code?.trim().toUpperCase() ?? "",
      })
    );

    return {
      data: competitions,
      error: null,
      isMockData: false,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }

    console.error(
      "Erreur lors de la récupération des championnats du pays :",
      err
    );

    return {
      data: null,
      error:
        err instanceof Error
          ? err.message
          : "Impossible de récupérer les championnats du pays.",
      isMockData: false,
    };
  }
}

export async function fetchMatchById(
  id: string,
  signal?: AbortSignal
): Promise<ApiResult<Match | undefined>> {
  console.log("🎯 fetchMatchById APPELÉ →", {
    id,
    API_BASE_URL,
    url: API_BASE_URL
      ? `${API_BASE_URL}/api/matches/${id}`
      : "API_BASE_URL VIDE",
  });

  if (!API_BASE_URL) {
    console.log("⚠️ API_BASE_URL est vide → utilisation du mock");

    return {
      data: getMockMatchById(id),
      error: null,
      isMockData: true,
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/matches/${id}`,
      {
        signal,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📡 MATCH DETAIL HTTP :", response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    console.log("📦 RESULT API MATCH :", result);

    return {
      data: result.data ?? result,
      error: null,
      isMockData: false,
    };
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw error;
    }

    console.error("❌ fetchMatchById ERROR :", error);

    return {
      data: undefined,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load match",
      isMockData: false,
    };
  }
}


export interface MatchEvent {
  time: {
    elapsed: number | null;
    extra: number | null;
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
  player: {
    id: number | null;
    name: string | null;
  };
  assist: {
    id: number | null;
    name: string | null;
  };
  type: string;
  detail: string;
  comments: string | null;
}

export async function fetchLiveMatchEvents(
  matchId: string
): Promise<MatchEvent[]> {
  if (!API_BASE_URL) return [];

  const response = await fetch(
    `${API_BASE_URL}/api/matches/${encodeURIComponent(matchId)}/events`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Events API returned ${response.status}`);
  }

  const result = await response.json();

  return Array.isArray(result.events) ? result.events : [];
}


export async function fetchCompetitions(signal?: AbortSignal): Promise<ApiResult<Competition[]>> {
  if (!API_BASE_URL) {
    return { data: getMockCompetitions(), error: null, isMockData: true };
  }
  // Derive competitions from matches
  const result = await fetchMatches(signal);
  if (result.data) {
    const comps = new Map<string, Competition>();
    for (const m of [...result.data.live, ...result.data.upcoming, ...result.data.finished]) {
      if (!comps.has(m.competition.id)) {
        comps.set(m.competition.id, m.competition);
      }
    }
    return { data: Array.from(comps.values()), error: null, isMockData: result.isMockData };
  }
  return { data: getMockCompetitions(), error: null, isMockData: true };
}


export async function fetchStandings(
  compId: string,
  season: number,
  signal?: AbortSignal
): Promise<ApiResult<Standings | undefined>> {
  console.log("🏆 fetchStandings APPELÉ →", compId);

  if (!API_BASE_URL) {
    console.log("⚠️ API_BASE_URL VIDE");
    return {
      data: getMockStandings(compId),
      error: null,
      isMockData: true,
    };
  }

  try {
    const url = `${API_BASE_URL}/api/competitions/${compId}/standings?season=${season}`;

    console.log("🌐 URL STANDINGS →", url);

    const response = await fetch(url, {
      signal,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📡 STANDINGS HTTP →", response.status);

    if (!response.ok) {
      throw new Error(
        `Standings API returned ${response.status}`
      );
    }

    const result = await response.json();

    console.log("📦 RESULT STANDINGS →", result);

      return {
        data: result,
        error: null,
       isMockData: false,
    };

  } catch (err) {
    console.error("❌ fetchStandings ERROR →", err);

    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }

    return {
      data: null,
      error:
        err instanceof Error
          ? err.message
          : "Impossible de récupérer le classement.",
      isMockData: false,
    };
  }
} 


export async function fetchTeamInfo(
  teamId: string,
  signal?: AbortSignal
): Promise<ApiResult<TeamDetails>> {
  if (!API_BASE_URL) {
    return {
      data: null,
      error: 'Backend non connecté.',
      isMockData: true,
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/teams/${encodeURIComponent(teamId)}`,
      { signal }
    );

    if (!response.ok) {
      throw new Error(`Team API returned ${response.status}`);
    }

    const result = await response.json();

    return {
      data: result.data ?? null,
      error: null,
      isMockData: false,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }

    return {
      data: null,
      error: err instanceof Error
        ? err.message
        : 'Impossible de récupérer les informations du club.',
      isMockData: false,
    };
  }
}


export async function fetchTeamFixtures(
  teamId: string,
  season: number,
  status: 'all' | 'finished' | 'scheduled' | 'live' = 'all',
  signal?: AbortSignal
): Promise<ApiResult<TeamFixturesResponse>> {
  if (!API_BASE_URL) {
    return {
      data: null,
      error: 'Backend non connecté.',
      isMockData: true,
    };
  }

  try {
    const params = new URLSearchParams({
      season: String(season),
      status,
    });

    const response = await fetch(
      `${API_BASE_URL}/api/teams/${encodeURIComponent(teamId)}/fixtures?${params.toString()}`,
      {
        signal,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Team fixtures API returned ${response.status}`
      );
    }

    const result = await response.json();

    const fixtures = (result.data ?? []).map((match: any) => ({
      id: String(match.id),

      status:
        match.status === 'finished'
          ? 'finished'
          : match.status === 'live'
            ? 'live'
            : 'upcoming',

      kickoff: match.kickoff_utc,

      homeTeam: {
        id: String(match.teams.home.id),
        name: match.teams.home.name,
        shortName:
          match.teams.home.short_name ??
          match.teams.home.name,
        logo: match.teams.home.logo ?? undefined,
      },

      awayTeam: {
        id: String(match.teams.away.id),
        name: match.teams.away.name,
        shortName:
          match.teams.away.short_name ??
          match.teams.away.name,
        logo: match.teams.away.logo ?? undefined,
      },

      homeScore: match.goals?.home ?? null,
      awayScore: match.goals?.away ?? null,

      competition: {
        id: String(match.league?.id ?? ''),
        name: match.league?.name ?? '',
      },
    }));

    const firstMatch = fixtures[0];

    const team = firstMatch
      ? firstMatch.homeTeam.id === String(teamId)
        ? firstMatch.homeTeam
        : firstMatch.awayTeam
      : {
          id: String(teamId),
          name: `Équipe ${teamId}`,
          shortName: `Équipe ${teamId}`,
        };

    return {
      data: {
        team,
        fixtures,
      },
      error: null,
      isMockData: false,
    };
  } catch (err) {
    if (
      err instanceof DOMException &&
      err.name === 'AbortError'
    ) {
      throw err;
    }

    console.error(
      "Erreur lors de la récupération des matchs de l'équipe :",
      err
    );

    return {
      data: null,
      error:
        err instanceof Error
          ? err.message
          : "Impossible de récupérer les matchs de l'équipe.",
      isMockData: false,
    };
  }
}



export type { FetchState };
