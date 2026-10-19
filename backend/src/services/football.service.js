import { mapLiveMatch, mapMatchDetail  } from "./match.mapper.js";

const API_URL = "https://api.5dollarfootballapi.com/v1";

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
  live: 30 * 1000,
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
let popularCompetitionsRequestPromise = null;``

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
    `${API_URL}/fixtures?status=live&lang=fr`,
    {
      headers: {
        Authorization: `Bearer ${process.env.FOOTBALL_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Football API error: ${response.status}`);
  }

  const data = await response.json();

  const matches = data.data.map(mapLiveMatch);

  cache.live.data = matches;
  cache.live.timestamp = now;

  console.log("🌐 API LIVE appelée");

  return matches;
}

export async function getUpcomingMatches() {
  const now = Date.now();

  if (
    cache.upcoming.data &&
    now - cache.upcoming.timestamp < CACHE_DURATION.upcoming
  ) {
    console.log("📦 Cache UPCOMING utilisé");
    return cache.upcoming.data;
  }

  const response = await fetch(
    `${API_URL}/fixtures?status=scheduled&lang=fr`,
    {
      headers: {
        Authorization: `Bearer ${process.env.FOOTBALL_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Football API error: ${response.status}`);
  }

  const data = await response.json();

  cache.upcoming.data = data;
  cache.upcoming.timestamp = now;

  console.log("🌐 API UPCOMING appelée");

  return data;
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

  const response = await fetch(
    `${API_URL}/fixtures?status=finished&lang=fr`,
    {
      headers: {
        Authorization: `Bearer ${process.env.FOOTBALL_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Football API error: ${response.status}`);
  }

  const data = await response.json();

  cache.finished.data = data;
  cache.finished.timestamp = now;

  console.log("🌐 API FINISHED appelée");

  return data;
}

export async function getMatchById(id) {
  const response = await fetch(
    `${API_URL}/fixtures/${id}?include=events,stats&lang=fr`,
    {
      headers: {
        Authorization: `Bearer ${process.env.FOOTBALL_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Football API error: ${response.status}`);
  }

  const data = await response.json();

  return mapMatchDetail(data.data);
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
    const countries = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `${API_URL}/countries?page=${page}&per_page=250&lang=fr`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FOOTBALL_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Football API error: ${response.status}`);
      }

      const data = await response.json();

      countries.push(...data.data);

      hasMore = data.pagination?.has_more ?? false;
      page++;
    }

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
    `${API_URL}/leagues?country=${country}&lang=fr`,
    {
      headers: {
        Authorization: `Bearer ${process.env.FOOTBALL_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Football API error: ${response.status}`);
  }

  const data = await response.json();

  return data;
}


export async function getCompetitionById(id) {
  const response = await fetch(
    `${API_URL}/leagues/${id}?lang=fr`,
    {
      headers: {
        Authorization: `Bearer ${process.env.FOOTBALL_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Football API error: ${response.status}`
    );
  }

  const data = await response.json();

  return data;
}


export async function getCompetitionStandings(id) {
  const response = await fetch(
    `${API_URL}/standings?league=${id}&type=total&lang=fr`,
    {
      headers: {
        Authorization: `Bearer ${process.env.FOOTBALL_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Football API error: ${response.status}`
    );
  }

  const data = await response.json();

  return data;
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

    for (let page = 1; page <= 5; page++) {
      const response = await fetch(
        `${API_URL}/leagues?popular=1&page=${page}&per_page=50&lang=fr`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FOOTBALL_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Football API error: ${response.status}`);
      }

      const result = await response.json();

      for (const league of result.data ?? []) {
        const countryCode = league.country?.code
          ?.trim()
          .toUpperCase();

        if (!countryCode || !targetCountries.includes(countryCode)) {
          continue;
        }

        const leagueName = league.name?.toLowerCase() ?? "";

        const isTargetLeague = targetLeagues[countryCode]?.some(
          (name) => leagueName.includes(name.toLowerCase())
        );

        if (!isTargetLeague) {
          continue;
        }

        if (seenIds.has(league.id)) {
          continue;
        }

        seenIds.add(league.id);

        competitions.push({
          ...league,
          country: league.country?.name ?? "",
          countryCode,
        });
      }

      if (!result.pagination?.has_more) {
        break;
      }
    }

      // ---------------------------------------------------------
// 2. Si la Serie A n'est pas dans popular=1,
//    on la recherche directement en Italie
// ---------------------------------------------------------

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
            Authorization: `Bearer ${process.env.FOOTBALL_API_KEY}`,
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