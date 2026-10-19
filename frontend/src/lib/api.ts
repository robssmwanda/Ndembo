import type { MatchesResponse, Match, Competition, Standings } from '@/types';
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

    const competitions = (result.data ?? []).map(
      (competition: any) => ({
        ...competition,
        country: competition.country ?? "",
        countryCode:
          competition.countryCode?.trim().toUpperCase() ?? "",
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

    const competition = result.data
      ? {
          ...result.data,
          country: result.data.country?.name ?? "",
          countryCode:
            result.data.country?.code?.trim().toUpperCase() ?? "",
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
  signal?: AbortSignal,
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

export async function fetchMatchById(id: string, signal?: AbortSignal): Promise<ApiResult<Match | undefined>> {
  if (!API_BASE_URL) {
    return { data: getMockMatchById(id), error: null, isMockData: true };
  }
  // The backend only has /api/matches; we fetch all and filter
  const result = await fetchMatches(signal);
  if (result.data) {
    const match = [...result.data.live, ...result.data.upcoming, ...result.data.finished].find(m => m.id === id);
    return { data: match, error: null, isMockData: result.isMockData };
  }
  return { data: undefined, error: result.error, isMockData: result.isMockData };
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
  signal?: AbortSignal
): Promise<ApiResult<Standings | undefined>> {
  if (!API_BASE_URL) {
    return {
      data: getMockStandings(compId),
      error: null,
      isMockData: true,
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/competitions/${compId}/standings`,
      {
        signal,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Standings API returned ${response.status}`
      );
    }

    const result = await response.json();

    return {
      data: result.data ?? undefined,
      error: null,
      isMockData: false,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }

    console.error(
      "Erreur lors de la récupération du classement :",
      err
    );

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


export type { FetchState };
