export function mapLiveMatch(fixture) {
  return {
    id: String(fixture.fixture.id),

    competition: {
      id: String(fixture.league.id),
      name: fixture.league.name,
      country: fixture.league.country,
      season: fixture.league.season
    },

    homeTeam: {
      id: String(fixture.teams.home.id),
      name: fixture.teams.home.name,
      logo: fixture.teams.home.logo,
    },

    awayTeam: {
      id: String(fixture.teams.away.id),
      name: fixture.teams.away.name,
      logo: fixture.teams.away.logo,
    },

    kickoff: fixture.fixture.date,

    status: "live",

    minute:
      fixture.fixture.status.short === "HT"
        ? "MT"
        : fixture.fixture.status.elapsed ?? null,

    homeScore: fixture.goals.home,
    awayScore: fixture.goals.away,

    corners: {
      home: 0,
      away: 0,
    },

    cards: {
      home: {
        yellow: 0,
        red: 0,
      },
      away: {
        yellow: 0,
        red: 0,
      },
    },
  };
}


export function mapUpcomingMatch(fixture) {

  return {
    id: String(fixture.fixture.id),

    competition: {
      id: String(fixture.league.id),
      name: fixture.league.name,
    },

    homeTeam: {
      id: String(fixture.teams.home.id),
      name: fixture.teams.home.name,
      logo: fixture.teams.home.logo,
    },

    awayTeam: {
      id: String(fixture.teams.away.id),
      name: fixture.teams.away.name,
      logo: fixture.teams.away.logo,
    },


    kickoff: fixture.fixture.date,

    status: "upcoming",

    minute: null,

    homeScore: fixture.goals.home,
    awayScore: fixture.goals.away,

    corners: {
      home: 0,
      away: 0,
    },

    cards: {
      home: {
        yellow: 0,
        red: 0,
      },
      away: {
        yellow: 0,
        red: 0,
      },
    },
  };
}


export function mapFinishedMatch(fixture) {
  return {
    id: String(fixture.fixture.id),

    competition: {
      id: String(fixture.league.id),
      name: fixture.league.name,
    },

    homeTeam: {
      id: String(fixture.teams.home.id),
      name: fixture.teams.home.name,
      logo: fixture.teams.home.logo,
    },

    awayTeam: {
      id: String(fixture.teams.away.id),
      name: fixture.teams.away.name,
      logo: fixture.teams.away.logo,
    },

    kickoff: fixture.fixture.date,

    status: "finished",

    minute: null,

    homeScore: fixture.goals.home,
    awayScore: fixture.goals.away,

    corners: {
      home: 0,
      away: 0,
    },

    cards: {
      home: {
        yellow: 0,
        red: 0,
      },
      away: {
        yellow: 0,
        red: 0,
      },
    },
  };
}

export function mapMatchDetail(fixture) {
  const finishedStatuses = ["FT", "AET", "PEN"];

  return {
    id: String(fixture.fixture.id),

    competition: {
      id: String(fixture.league.id),
      name: fixture.league.name,
      country: fixture.league.country,
      season: fixture.league.season
    },

      homeTeam: {
        id: String(fixture.teams.home.id),
        name: fixture.teams.home.name,
        logo: fixture.teams.home.logo,
      },

    awayTeam: {
      id: String(fixture.teams.away.id),
      name: fixture.teams.away.name,
      logo: fixture.teams.away.logo,
    },

    kickoff: fixture.fixture.date,

    status:
      finishedStatuses.includes(fixture.fixture.status.short)
        ? "finished"
        : fixture.fixture.status.short === "NS"
        ? "upcoming"
        : "live",

    minute:
      fixture.fixture.status.short === "HT"
        ? "MT"
        : fixture.fixture.status.elapsed ?? null,

    homeScore: fixture.goals.home,
    awayScore: fixture.goals.away,

    corners: {
      home: 0,
      away: 0,
    },

    cards: {
      home: {
        yellow: 0,
        red: 0,
      },
      away: {
        yellow: 0,
        red: 0,
      },
    },

    events: (fixture.events ?? []).map((event, index) => ({
      id: `${fixture.fixture.id}-${index}`,

      team:
        event.team?.id === fixture.teams.home.id
          ? "home"
          : "away",

      player: event.player?.name ?? "",

      minute:
        event.time?.extra
          ? `${event.time.elapsed}+${event.time.extra}'`
          : `${event.time?.elapsed ?? ""}'`,

      type:
          event.type === "Goal" && event.detail === "Normal Goal"
            ? "goal"
            : event.type === "Goal" && event.detail === "Goal Disallowed"
            ? "var"
            : event.type === "Var"
            ? "var"
            : event.type === "Card" && event.detail === "Yellow Card"
            ? "yellow_card"
            : event.type === "Card" && event.detail === "Red Card"
            ? "red_card"
            : event.type === "subst"
            ? "substitution"
            : "unknown",

      detail: event.detail ?? null,

      assist: event.assist?.name ?? null,
    })),

    statistics: (() => {
      const homeStats =
        fixture.statistics?.find(
          (item) => item.team?.id === fixture.teams.home.id
        )?.statistics ?? [];

      const awayStats =
        fixture.statistics?.find(
          (item) => item.team?.id === fixture.teams.away.id
        )?.statistics ?? [];

      const statMap = new Map();

      homeStats.forEach((stat) => {
        statMap.set(stat.type, {
          label: stat.type,
          home: stat.value,
          away: null,
        });
      });

      awayStats.forEach((stat) => {
        if (statMap.has(stat.type)) {
          statMap.get(stat.type).away = stat.value;
        } else {
          statMap.set(stat.type, {
            label: stat.type,
            home: null,
            away: stat.value,
          });
        }
      });

      return {
        items: Array.from(statMap.values()),
      };
    })(),

    lineups: null,
  };
}