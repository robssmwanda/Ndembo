export function mapLiveMatch(fixture) {
  return {
    id: String(fixture.id),

    competition: {
      id: String(fixture.league.id),
      name: fixture.league.name,
    },

    homeTeam: {
      id: String(fixture.teams.home.id),
      name: fixture.teams.home.name,
    },

    awayTeam: {
      id: String(fixture.teams.away.id),
      name: fixture.teams.away.name,
    },

    kickoff: fixture.kickoff_utc,

    status: "live",

    minute:
      fixture.status_code === "half"
        ? "MT"
        : fixture.status_code,

    homeScore: fixture.goals.home,
    awayScore: fixture.goals.away,

    corners: {
      home: fixture.corners.home,
      away: fixture.corners.away,
    },

    cards: {
      home: {
        yellow: fixture.cards.home.yellow,
        red: fixture.cards.home.red,
      },
      away: {
        yellow: fixture.cards.away.yellow,
        red: fixture.cards.away.red,
      },
    },
  };
}


export function mapUpcomingMatch(fixture) {
  return {
    id: String(fixture.id),

    competition: {
      id: String(fixture.league.id),
      name: fixture.league.name,
    },

    homeTeam: {
      id: String(fixture.teams.home.id),
      name: fixture.teams.home.name,
    },

    awayTeam: {
      id: String(fixture.teams.away.id),
      name: fixture.teams.away.name,
    },

    kickoff: fixture.kickoff_utc,

    status: "upcoming",

    minute: null,

    homeScore: fixture.goals.home,
    awayScore: fixture.goals.away,

    corners: {
      home: fixture.corners.home,
      away: fixture.corners.away,
    },

    cards: {
      home: {
        yellow: fixture.cards.home.yellow,
        red: fixture.cards.home.red,
      },
      away: {
        yellow: fixture.cards.away.yellow,
        red: fixture.cards.away.red,
      },
    },
  };
}

export function mapFinishedMatch(fixture) {
  return {
    id: String(fixture.id),

    competition: {
      id: String(fixture.league.id),
      name: fixture.league.name,
    },

    homeTeam: {
      id: String(fixture.teams.home.id),
      name: fixture.teams.home.name,
    },

    awayTeam: {
      id: String(fixture.teams.away.id),
      name: fixture.teams.away.name,
    },

    kickoff: fixture.kickoff_utc,

    status: "finished",

    minute: null,

    homeScore: fixture.goals.home,
    awayScore: fixture.goals.away,

    corners: {
      home: fixture.corners.home,
      away: fixture.corners.away,
    },

    cards: {
      home: {
        yellow: fixture.cards.home.yellow,
        red: fixture.cards.home.red,
      },
      away: {
        yellow: fixture.cards.away.yellow,
        red: fixture.cards.away.red,
      },
    },
  };
}


export function mapMatchDetail(fixture) {
  return {
    id: String(fixture.id),

    competition: {
      id: String(fixture.league.id),
      name: fixture.league.name,
    },

    homeTeam: {
      id: String(fixture.teams.home.id),
      name: fixture.teams.home.name,
    },

    awayTeam: {
      id: String(fixture.teams.away.id),
      name: fixture.teams.away.name,
    },

    kickoff: fixture.kickoff_utc,

    status:
      fixture.status_code === "full"
        ? "finished"
        : fixture.status === "scheduled"
        ? "upcoming"
        : "live",

    minute:
      fixture.status_code === "half"
        ? "MT"
        : fixture.status_code,

    homeScore: fixture.goals.home,
    awayScore: fixture.goals.away,

    corners: {
      home: fixture.corners.home,
      away: fixture.corners.away,
    },

    cards: {
      home: {
        yellow: fixture.cards.home.yellow,
        red: fixture.cards.home.red,
      },
      away: {
        yellow: fixture.cards.away.yellow,
        red: fixture.cards.away.red,
      },
    },

    events: fixture.events ?? [],

    statistics: fixture.statistics
      ? {
          items: [
            {
              label: "Attaques",
              home: fixture.statistics.attacks?.home ?? 0,
              away: fixture.statistics.attacks?.away ?? 0,
            },
            {
              label: "Attaques dangereuses",
              home: fixture.statistics.dangerous_attacks?.home ?? 0,
              away: fixture.statistics.dangerous_attacks?.away ?? 0,
            },
            {
              label: "Tirs cadrés",
              home: fixture.statistics.shots_on_target?.home ?? 0,
              away: fixture.statistics.shots_on_target?.away ?? 0,
            },
            {
              label: "Tirs non cadrés",
              home: fixture.statistics.shots_off_target?.home ?? 0,
              away: fixture.statistics.shots_off_target?.away ?? 0,
            },
            {
              label: "Possession",
              home: fixture.statistics.possession?.home ?? 0,
              away: fixture.statistics.possession?.away ?? 0,
            },
          ],
        }
      : null,

    lineups: [],
  };
}