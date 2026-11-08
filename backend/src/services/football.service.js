import {
  mapLiveMatch,
  mapMatchDetail,
  mapUpcomingMatch,
  mapFinishedMatch,
} from "./match.mapper.js";

const API_URL = "https://v3.football.api-sports.io";

const cache = {
  live: {
    data: null,
    timestamp: 0,
  },
  upcoming: {
    data: null,
    timestamp: 0,
  },
  finished: {
    data: null,
    timestamp: 0,
  },
  popular: {
    data: null,
    timestamp: 0,
  },
};

const CACHE_DURATION = {
  live: 10 * 1000,
  upcoming: 5 * 60 * 1000,
  finished: 5 * 60 * 1000,
  popular: 30 * 60 * 1000,
};

const countriesCache = {
  data: null,
  expiresAt: 0,
};

const COUNTRIES_CACHE_DURATION = 5 * 60 * 60 * 1000;
let countriesRequestPromise = null;

const popularCompetitionsCache = {
  data: null,
  expiresAt: 0,
};

const POPULAR_COMPETITIONS_CACHE_DURATION = 60 * 60 * 1000;
let popularCompetitionsRequestPromise = null;

// ✅ Cache des matchs par date
const matchesByDateCache = new Map();

const DATE_CACHE_DURATION = 5 * 60 * 1000;

// Cache des événements des matchs en direct
const liveEventsCache = new Map();
const liveEventsRequests = new Map();

const LIVE_EVENTS_CACHE_DURATION = 60 * 1000;

// File d'attente globale pour les événements
let eventsQueue = Promise.resolve();
let lastEventsRequestAt = 0;
let eventsRateLimitUntil = 0;

// Délai provisoire : 3 secondes entre deux requêtes
const MIN_EVENTS_REQUEST_INTERVAL = 5000;

// Pause après une erreur de limite API
const EVENTS_RATE_LIMIT_COOLDOWN = 60 * 1000;

const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function getLiveMatches() {
  const now = Date.now();

  if (
    cache.live.data &&
    now - cache.live.timestamp < CACHE_DURATION.live
  ) {
    console.log("📦 Cache LIVE utilisé");
    return cache.live.data;
  }

  const response = await fetch(
    `${API_URL}/fixtures?live=all`,
    {
      headers: {
        "x-apisports-key": process.env.FOOTBALL_API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Football API error: ${response.status}`);
  }

  const data = await response.json();

  const matches = data.response.map(mapLiveMatch);

  cache.live.data = matches;
  cache.live.timestamp = now;

  console.log("🌐 API LIVE appelée");

  return matches;
}


// Récupérer les événements d'un match en direct

export async function getLiveMatchEvents(fixtureId) {
  const id = String(fixtureId);
  const now = Date.now();

  // 1. Vérifier le cache
  const cached = liveEventsCache.get(id);

  if (
    cached &&
    now - cached.timestamp < LIVE_EVENTS_CACHE_DURATION
  ) {
    console.log(`📦 Cache EVENTS utilisé → ${id}`);
    return cached.data;
  }

  // 2. Éviter les requêtes simultanées pour le même match
  if (liveEventsRequests.has(id)) {
    return liveEventsRequests.get(id);
  }

  // 3. Ajouter la requête à la file globale
  const request = eventsQueue.then(async () => {
    try {
      // Attendre la fin d'une éventuelle période de blocage
      const cooldownWait = eventsRateLimitUntil - Date.now();

      if (cooldownWait > 0) {
        console.log(`⏳ Pause API EVENTS : ${Math.ceil(cooldownWait / 1000)}s`);
        await wait(cooldownWait);
      }

      // Respecter le délai entre deux requêtes
      const elapsed = Date.now() - lastEventsRequestAt;
      const spacingWait = MIN_EVENTS_REQUEST_INTERVAL - elapsed;

      if (spacingWait > 0) {
        await wait(spacingWait);
      }

      lastEventsRequestAt = Date.now();

      const response = await fetch(
        `${API_URL}/fixtures/events?fixture=${id}`,
        {
          headers: {
            "x-apisports-key": process.env.FOOTBALL_API_KEY,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          eventsRateLimitUntil =
            Date.now() + EVENTS_RATE_LIMIT_COOLDOWN;
        }

        throw new Error(
          `Football API events error: ${response.status}`
        );
      }

      const result = await response.json();

      // Détecter une limite API même si HTTP retourne 200
      if (result.errors && Object.keys(result.errors).length > 0) {
        const errorText = JSON.stringify(result.errors).toLowerCase();

        if (
          errorText.includes("ratelimit") ||
          errorText.includes("too many requests")
        ) {
          eventsRateLimitUntil =
            Date.now() + EVENTS_RATE_LIMIT_COOLDOWN;
        }

        console.error(`❌ API EVENTS ERROR → ${id}:`, result.errors);

        throw new Error(
          `Erreur API EVENTS pour le match ${id}: ${JSON.stringify(result.errors)}`
        );
      }

      // 4. Enregistrer uniquement les réponses réussies
      const events = result.response ?? [];

      liveEventsCache.set(id, {
        data: events,
        timestamp: Date.now(),
      });

      console.log(
        `🌐 API EVENTS appelée → ${id} → ${events.length} événements`
      );

      return events;

    } finally {
      liveEventsRequests.delete(id);
    }
  });

  // La file continue même si une requête échoue
  eventsQueue = request.catch(() => {});

  liveEventsRequests.set(id, request);

  return request;
}



export async function getMatchesByDate(date) {
  const now = Date.now();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Date invalide. Format attendu : YYYY-MM-DD");
  }

  const cached = matchesByDateCache.get(date);

  if (
    cached &&
    now - cached.timestamp < DATE_CACHE_DURATION
  ) {
    console.log(`📦 Cache DATE utilisé → ${date}`);
    return cached.data;
  }

  console.log(`📅 API DATE → ${date}`);

  const response = await fetch(
    `${API_URL}/fixtures?date=${date}`,
    {
      headers: {
        "x-apisports-key": process.env.FOOTBALL_API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Football API error: ${response.status}`);
  }

  const data = await response.json();

  console.log(`🔎 API DATE ${date}:`, {
    results: data.results,
    errors: data.errors,
    responseLength: data.response?.length,
  });

  const matches = Array.isArray(data.response)
    ? data.response.map((fixture) => {
        const status = fixture.fixture?.status?.short;

        const finishedStatuses = [
          "FT",
          "AET",
          "PEN",
        ];

        const liveStatuses = [
          "1H",
          "HT",
          "2H",
          "ET",
          "P",
          "BT",
          "LIVE",
          "INT",
        ];

        if (finishedStatuses.includes(status)) {
          return mapFinishedMatch(fixture);
        }

        if (liveStatuses.includes(status)) {
          return mapLiveMatch(fixture);
        }

        return mapUpcomingMatch(fixture);
      })
    : [];

  const result = {
    data: matches,
  };

  matchesByDateCache.set(date, {
    data: result,
    timestamp: now,
  });

  console.log(
    `🌐 API DATE appelée → ${date} → ${matches.length} matchs`
  );

  return result;
}

export async function getFinishedMatches() {
  const now = Date.now();

  if (
    cache.finished.data &&
    now - cache.finished.timestamp < CACHE_DURATION.finished
  ) {
    console.log("📦 Cache FINISHED utilisé");
    return cache.finished.data;
  }

  const today = new Date();
  const date = today.toISOString().split("T")[0];

  console.log(`📅 API FINISHED → ${date}`);

  const response = await fetch(
    `${API_URL}/fixtures?date=${date}&status=FT-AET-PEN`,
    {
      headers: {
        "x-apisports-key": process.env.FOOTBALL_API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Football API error: ${response.status}`);
  }

  const data = await response.json();

  console.log("🔎 API FINISHED DEBUG:", {
    results: data.results,
    errors: data.errors,
    responseLength: data.response?.length,
    parameters: data.parameters,
  });

  const result = {
    ...data,
    data: Array.isArray(data.response) ? data.response : [],
  };

  cache.finished.data = result;
  cache.finished.timestamp = now;

  console.log(
    `🌐 API FINISHED appelée → ${result.data.length} matchs`
  );

  console.log(
  "🚨 FINISHED STATUSES:",
  result.data.map(match => ({
    home: match.teams?.home?.name,
    away: match.teams?.away?.name,
    status: match.fixture?.status?.short,
  }))
);

  return result;
}

export async function getMatchById(id) {
  console.log("🚨 getMatchById APPELÉ →", id);

  // 1️⃣ Récupérer le détail du match
  const response = await fetch(
    `${API_URL}/fixtures?id=${id}`,
    {
      headers: {
        "x-apisports-key": process.env.FOOTBALL_API_KEY,
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();

    console.error("❌ API MATCH DETAIL :", {
      status: response.status,
      body: errorBody,
    });

    throw new Error(
      `Football API error: ${response.status} - ${errorBody}`
    );
  }

  const data = await response.json();

  console.log("🔎 MATCH DETAIL API :", {
    results: data.results,
    errors: data.errors,
    responseLength: data.response?.length,
  });

  const fixture = data.response?.[0];

  if (!fixture) {
    throw new Error(`Match ${id} introuvable dans API-Football`);
  }

  // 2️⃣ Récupérer les statistiques du match
  const statisticsResponse = await fetch(
    `${API_URL}/fixtures/statistics?fixture=${id}`,
    {
      headers: {
        "x-apisports-key": process.env.FOOTBALL_API_KEY,
      },
    }
  );

  if (!statisticsResponse.ok) {
    const errorBody = await statisticsResponse.text();

    console.error("❌ API MATCH STATISTICS :", {
      status: statisticsResponse.status,
      body: errorBody,
    });

    throw new Error(
      `Football API statistics error: ${statisticsResponse.status} - ${errorBody}`
    );
  }

  const statisticsData = await statisticsResponse.json();

  console.log("📊 MATCH STATISTICS API :", {
    results: statisticsData.results,
    errors: statisticsData.errors,
    responseLength: statisticsData.response?.length,
  });

  // Injecter les statistiques dans le fixture
  fixture.statistics = statisticsData.response ?? [];
    // 3️⃣ Récupérer les compositions
  const lineupsResponse = await fetch(
    `${API_URL}/fixtures/lineups?fixture=${id}`,
    {
      headers: {
        "x-apisports-key": process.env.FOOTBALL_API_KEY,
      },
    }
  );

  if (!lineupsResponse.ok) {
    const errorBody = await lineupsResponse.text();

    console.error("❌ API MATCH LINEUPS :", {
      status: lineupsResponse.status,
      body: errorBody,
    });

    throw new Error(
      `Football API lineups error: ${lineupsResponse.status} - ${errorBody}`
    );
  }

 const lineupsData = await lineupsResponse.json();

  console.log("👥 MATCH LINEUPS API :", {
    results: lineupsData.results,
    errors: lineupsData.errors,
    responseLength: lineupsData.response?.length,
  });

  fixture.lineups = lineupsData.response ?? [];

    return {
      data: mapMatchDetail(fixture),
    };
}

export async function getCountries() {
  if (countriesCache.data && Date.now() < countriesCache.expiresAt) {
    console.log("📦 Cache COUNTRIES utilisé");

    return {
      success: 1,
      data: countriesCache.data,
    };
  }

  if (countriesRequestPromise) {
    console.log("⏳ Requête COUNTRIES déjà en cours");

    return await countriesRequestPromise;
  }

    countriesRequestPromise = (async () => {
        const response = await fetch(
          `${API_URL}/countries`,
          {
            headers: {
              "x-apisports-key": process.env.FOOTBALL_API_KEY,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Football API error: ${response.status}`);
        }

        const data = await response.json();

        const countries = data.response ?? [];

        countriesCache.data = countries;
        countriesCache.expiresAt =
          Date.now() + COUNTRIES_CACHE_DURATION;

        console.log("🌐 API COUNTRIES appelée");
        console.log(`🌍 ${countries.length} pays chargés`);

        return {
          success: 1,
          data: countries,
        };
      })();

  try {
    return await countriesRequestPromise;
  } finally {
    countriesRequestPromise = null;
  }
}


export async function getLeaguesByCountry(country) {
  const response = await fetch(
    `${API_URL}/leagues?country=${encodeURIComponent(country)}`,
    {
      headers: {
        "x-apisports-key": process.env.FOOTBALL_API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Football API error: ${response.status}`);
  }

  const data = await response.json();

  console.log("🏆 LEAGUES BY COUNTRY :", {
    country,
    results: data.results,
    errors: data.errors,
    responseLength: data.response?.length ?? 0,
  });

  return data;
}


export async function getCompetitionById(id) {
  const response = await fetch(
    `${API_URL}/leagues?id=${id}`,
    {
      headers: {
        "x-apisports-key": process.env.FOOTBALL_API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Football API error: ${response.status}`
    );
  }

  const data = await response.json();

  console.log("🏆 COMPÉTITION PAR ID :", {
    id,
    results: data.results,
    errors: data.errors,
    responseLength: data.response?.length ?? 0,
  });

  return data;
}


export async function getCompetitionStandings(id, season) {
  console.log("🏆 getCompetitionStandings →", {
    id,
    season,
  });

  const response = await fetch(
    `${API_URL}/standings?league=${id}&season=${season}`,
    {
      headers: {
        "x-apisports-key": process.env.FOOTBALL_API_KEY,
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();

    console.error("❌ API STANDINGS :", {
      status: response.status,
      body: errorBody,
    });

    throw new Error(
      `Football API standings error: ${response.status} - ${errorBody}`
    );
  }

  const data = await response.json();

  console.log("📊 STANDINGS API :", {
    results: data.results,
    errors: data.errors,
    responseLength: data.response?.length,
  });

  const league = data.response?.[0]?.league;

  if (!league) {
    return {
      competition: {
        id: String(id),
        name: "",
      },
      season: season ?? null,
      table: [],
    };
  }

  const rawTable = league.standings?.[0] ?? [];
  console.log("🛡️ LOGOS STANDINGS :", rawTable.slice(0, 3).map(row => ({
    team: row.team?.name,
    logo: row.team?.logo,
  })));
  
  return {
    competition: {
      id: String(league.id),
      name: league.name,
      country: league.country,
    },

    season: league.season,

    table: rawTable.map((row) => ({
      position: row.rank,

      team: {
        id: String(row.team.id),
        name: row.team.name,
        logo: row.team.logo ?? null,
      },

      played: row.all?.played ?? 0,
      wins: row.all?.win ?? 0,
      draws: row.all?.draw ?? 0,
      losses: row.all?.lose ?? 0,

      goalsFor: row.all?.goals?.for ?? 0,
      goalsAgainst: row.all?.goals?.against ?? 0,

      goalDifference: row.goalsDiff ?? 0,

      points: row.points ?? 0,
    })),
  };
}


export async function getTeamFixtures(
  id,
  season,
  status = "all"
) {
  const url =
    `${API_URL}/fixtures?team=${encodeURIComponent(id)}` +
    `&season=${encodeURIComponent(season)}`;

  console.log("🌐 MATCHS DU CLUB :", {
    teamId: id,
    season,
    status,
    url,
  });

  const response = await fetch(url, {
    headers: {
      "x-apisports-key": process.env.FOOTBALL_API_KEY,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();

    console.error("❌ API MATCHS DU CLUB :", {
      httpStatus: response.status,
      body: errorBody,
    });

    throw new Error(
      `Football API error: ${response.status}`
    );
  }

  const data = await response.json();

  if (data.errors && Object.keys(data.errors).length > 0) {
    console.error("❌ Erreur API-Football :", data.errors);

    throw new Error("API-Football a retourné une erreur.");
  }

  const liveStatuses = new Set([
    "1H", "HT", "2H", "ET", "BT", "P",
    "LIVE", "INT", "SUSP", "INPLAY",
  ]);

  const finishedStatuses = new Set([
    "FT", "AET", "PEN",
  ]);

  const fixtures = (data.response ?? []).map((item) => {
    const apiStatus = item.fixture?.status?.short;

    const matchStatus = finishedStatuses.has(apiStatus)
      ? "finished"
      : liveStatuses.has(apiStatus)
        ? "live"
        : "upcoming";

    return {
      id: String(item.fixture.id),
      status: matchStatus,
      kickoff_utc: item.fixture.date,

      teams: {
        home: {
          id: String(item.teams.home.id),
          name: item.teams.home.name,
          logo: item.teams.home.logo ?? null,
          short_name: item.teams.home.name,
        },
        away: {
          id: String(item.teams.away.id),
          name: item.teams.away.name,
          logo: item.teams.away.logo ?? null,
          short_name: item.teams.away.name,
        },
      },

      goals: {
        home: item.goals?.home ?? null,
        away: item.goals?.away ?? null,
      },

      league: {
        id: String(item.league?.id ?? ""),
        name: item.league?.name ?? "",
        logo: item.league?.logo ?? null,
        season: item.league?.season ?? season,
      },

      fixtureStatus: {
        short: apiStatus ?? null,
        long: item.fixture?.status?.long ?? null,
        elapsed: item.fixture?.status?.elapsed ?? null,
      },
    };
  });

  const filteredFixtures =
    status === "finished"
      ? fixtures.filter((match) => match.status === "finished")
      : status === "scheduled" || status === "upcoming"
        ? fixtures.filter((match) => match.status === "upcoming")
        : status === "live"
          ? fixtures.filter((match) => match.status === "live")
          : fixtures;

  filteredFixtures.sort((a, b) => {
    const dateA = new Date(a.kickoff_utc).getTime();
    const dateB = new Date(b.kickoff_utc).getTime();

    // Matchs terminés : du plus récent au plus ancien
    if (status === "finished") {
      return dateB - dateA;
    }

    // Matchs à venir : du plus proche au plus éloigné
    // Matchs en direct : du plus ancien au plus récent
    return dateA - dateB;
  });

  console.log("📊 MATCHS DU CLUB RÉCUPÉRÉS :", {
    teamId: id,
    season,
    total: filteredFixtures.length,
  });

  return {  
    success: 1,
    data: filteredFixtures,
  };
}


export async function getPopularCompetitions() {
  const now = Date.now();

  // Utiliser le cache pendant 1 heure
  if (
    popularCompetitionsCache.data &&
    now < popularCompetitionsCache.expiresAt
  ) {
    console.log("📦 Cache COMPÉTITIONS utilisé");
    return {
      success: 1,
      data: popularCompetitionsCache.data,
    };
  }

  // Éviter plusieurs requêtes simultanées
  if (popularCompetitionsRequestPromise) {
    console.log("⏳ Requête COMPÉTITIONS déjà en cours");
    return popularCompetitionsRequestPromise;
  }

  popularCompetitionsRequestPromise = (async () => {
    console.log("🌐 API COMPÉTITIONS appelée");

      const targetCountries = [
        "GB-ENG",
        "ES",
        "IT",
        "DE",
        "FR",
        "NL",
        "PT",
        "BE",
        "TR",
        "GB-SCT",
        "GR",
        "AT",
        "CH",
        "DK",
        "NO",
      ];

    const countryNames = {
      "GB-ENG": "England",
      ES: "Spain",
      IT: "Italy",
      DE: "Germany",
      FR: "France",
      NL: "Netherlands",
      PT: "Portugal",
      BE: "Belgium",
      TR: "Turkey",
      "GB-SCT": "Scotland",
      GR: "Greece",
      AT: "Austria",
      CH: "Switzerland",
      DK: "Denmark",
      NO: "Norway",
    };

    const targetLeagues = {
      "GB-ENG": ["Premier League"],
      ES: ["La Liga"],
      IT: ["Serie A"],
      DE: ["Bundesliga"],
      FR: ["Ligue 1"],
      NL: ["Eredivisie"],
      PT: ["Primeira Liga", "Liga Portugal"],
      BE: ["1re Division A", "Pro League"],
      TR: ["Süper Lig", "Super Lig"],
      "GB-SCT": ["Premiership"],
      GR: ["Super League"],
      AT: ["Bundesliga"],
      CH: ["Super League"],
      DK: ["Superliga"],
      NO: ["Eliteserien"],
    };

    const competitions = [];
    const seenIds = new Set();

    // ---------------------------------------------------------
    // 1. Récupération des compétitions populaires
    // ---------------------------------------------------------

    for (let page = 1; page <= targetCountries.length; page++) {
      const response = await fetch(
        `${API_URL}/leagues?country=${encodeURIComponent(countryNames[targetCountries[page - 1]])}`,
        {
          headers: {
            "x-apisports-key": process.env.FOOTBALL_API_KEY,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error("❌ API COMPÉTITIONS ERROR :", {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          body: errorText,
        });

        throw new Error(`Football API error: ${response.status} - ${errorText}`);

      }

      const result = await response.json();

     console.log("🔎 LEAGUES RESPONSE :", {
        results: result.results,
        errors: result.errors,
        parameters: result.parameters,
        responseLength: result.response?.length,
        firstLeague: result.response?.[0],
      });

      for (const league of result.response ?? []) {
        const countryCode = league.country?.code
          ?.trim()
          .toUpperCase();

        if (!countryCode) {
          continue;
        }

       const leagueName = league.league?.name?.toLowerCase() ?? "";

        const isTargetLeague = targetLeagues[countryCode]?.some(
          (name) => leagueName.includes(name.toLowerCase())
        );

        if (!isTargetLeague) {
          continue;
        }

        if (seenIds.has(league.id)) {
          continue;
        }

        seenIds.add(league.league?.id);

        competitions.push({
          ...league,
          country: league.country?.name ?? "",
          countryCode,
        });
      }

    }

    const hasSerieA = competitions.some((competition) => {
      const countryCode = competition.countryCode?.trim().toUpperCase();

      const leagueName = (competition.name ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      return (
        countryCode === "IT" &&
        leagueName.includes("serie a")
      );
    });

    if (!hasSerieA) {
      console.log("🇮🇹 Serie A absente de popular=1, recherche directe...");

      const response = await fetch(
        `${API_URL}/leagues?country=IT&search=Serie%20A&lang=fr`,
        {
          headers: {
            "x-apisports-key": process.env.FOOTBALL_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Football API error (IT): ${response.status}`);
      }

      const result = await response.json();

      const serieA = (result.data ?? []).find((league) => {
        const countryCode = league.country?.code
          ?.trim()
          .toUpperCase();

        const leagueName = (league.name ?? "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();

        return (
          countryCode === "IT" &&
          leagueName.includes("serie a")
        );
      });

      if (serieA && !seenIds.has(serieA.id)) {
        competitions.push({
          ...serieA,
          country: serieA.country?.name ?? "",
          countryCode: "IT",
        });

        seenIds.add(serieA.id);

        console.log("🇮🇹 Serie A ajoutée");
      }
    }   

    // ---------------------------------------------------------
    // 3. Remettre les 10 championnats dans l'ordre souhaité
    // ---------------------------------------------------------

    const orderedCompetitions = targetCountries
      .map((countryCode) =>
        competitions.find(
          (competition) => competition.countryCode === countryCode
        )
      )
      .filter(Boolean);

    console.log(
      `🏆 ${orderedCompetitions.length}/10 championnats européens chargés`
    );

    // Cache pendant 1 heure
    popularCompetitionsCache.data = orderedCompetitions;
    popularCompetitionsCache.expiresAt =
      Date.now() + POPULAR_COMPETITIONS_CACHE_DURATION;

    return {
      success: 1,
      data: orderedCompetitions,
    };
  })();

  try {
    return await popularCompetitionsRequestPromise;
  } finally {
    popularCompetitionsRequestPromise = null;
  }
}

export async function getCompetitionsByCountry(country) {
  try {
    console.log(`🏆 Championnats du pays : ${country}`);

    const response = await fetch(
      `${API_URL}/leagues?country=${encodeURIComponent(country)}`,
      {
        headers: {
          "x-apisports-key": process.env.FOOTBALL_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Football API error: ${response.status}`);
    }

    const data = await response.json();

    console.log("🏆 LEAGUES BY COUNTRY API :", {
      country,
      results: data.results,
      errors: data.errors,
      responseLength: data.response?.length ?? 0,
    });

    const competitions = (data.response ?? []).map((item) => ({
      id: item.league?.id,
      name: item.league?.name,
      type: item.league?.type,
      logo: item.league?.logo,
      country: item.country?.name,
      countryCode: item.country?.code,
      countryFlag: item.country?.flag,
    }));

    return {
      success: 1,
      data: competitions,
    };
  } catch (error) {
    console.error(
      `❌ Erreur championnats pour ${country}:`,
      error.message
    );

    return {
      success: 0,
      data: [],
      error: error.message,
    };
  }
}


export async function getTeamInfo(id) {
  const response = await fetch(
    `${API_URL}/teams?id=${encodeURIComponent(id)}`,
    {
      headers: {
        "x-apisports-key": process.env.FOOTBALL_API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Football API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error("Impossible de récupérer les informations du club.");
  }

  const team = data.response?.[0]?.team;
  const venue = data.response?.[0]?.venue;

  if (!team) {
    throw new Error("Club introuvable dans API-Football.");
  }

  return {
    id: String(team.id),
    name: team.name,
    logo: team.logo ?? null,
    country: team.country ?? null,
    city: venue?.city ?? null,
  };
}



export async function searchTeams(search) {
  const query = String(search ?? "").trim();

  if (query.length < 2) {
    return [];
  }

  const response = await fetch(
    `${API_URL}/teams?search=${encodeURIComponent(query)}`,
    {
      headers: {
        "x-apisports-key": process.env.FOOTBALL_API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Football API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error("Erreur lors de la recherche des équipes.");
  }

  return (data.response ?? []).map(({ team, venue }) => ({
    id: String(team.id),
    name: team.name,
    logo: team.logo ?? null,
    country: team.country ?? null,
    city: venue?.city ?? null,
  }));
}
