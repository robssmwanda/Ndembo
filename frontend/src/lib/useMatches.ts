
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchMatches, fetchLiveMatchEvents, type ApiResult, type MatchEvent} from '@/lib/api';
import type { MatchesResponse, Match } from '@/types';
import { playGoalSound, playVarSound, playYellowCardSound, playRedCardSound, playSubstitutionSound, playStartMatchSound, playEndMatchSound,} from '@/lib/sounds';

interface UseMatchesResult {
  live: Match[];
  upcoming: Match[];
  finished: Match[];
  all: Match[];
  loading: boolean;
  error: string | null;
  isMockData: boolean;
  refresh: () => void;
}

// Intervalle de vérification par match
const EVENTS_CHECK_INTERVAL = 60 * 1000;

// Délai entre deux requêtes d'événements
const EVENTS_REQUEST_GAP = 2500;

// Identifiant unique d'un événement
function getEventKey(event: MatchEvent): string {
  return [
    event.time?.elapsed ?? '',
    event.time?.extra ?? '',
    event.team?.id ?? '',
    event.player?.id ?? event.player?.name ?? '',
    event.type ?? '',
    event.detail ?? '',
  ].join('-');
}

export function useMatches(
  autoRefresh = false,
  refreshInterval = 30
): UseMatchesResult {
  const [data, setData] = useState<MatchesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const mountedRef = useRef(true);

  // Mémoire des anciens statuts des matchs
  const previousStatusesRef = useRef(
    new Map<string, string>()
  );

  // Mémoire des anciens scores
  const previousScoresRef = useRef(
    new Map<string, { home: number; away: number }>()
  );

  // Mémoire des événements déjà détectés
  const previousEventsRef = useRef(
    new Map<string, Set<string>>()
  );

  // Dernière vérification de chaque match
  const lastEventsCheckRef = useRef(
    new Map<string, number>()
  );

  // File d'attente globale des événements
  const eventQueueRef = useRef<Promise<void>>(Promise.resolve());

  // Heure de la dernière requête globale
  const lastGlobalEventRequestRef = useRef(0);

  const refresh = useCallback(
    () => setRefreshKey((k) => k + 1),
    []
  );

  // =====================================
  // DÉTECTION DES ÉVÉNEMENTS
  // =====================================

  const checkMatchEvents = useCallback(async (match: Match) => {
    const matchId = String(match.id);
    const now = Date.now();

    const lastCheck =
      lastEventsCheckRef.current.get(matchId) ?? 0;

    if (now - lastCheck < EVENTS_CHECK_INTERVAL) {
      return;
    }

    // Réserver le créneau pour éviter les doublons
    lastEventsCheckRef.current.set(matchId, now);

    // Ajouter la requête à la file d'attente
    const queuedRequest = eventQueueRef.current.then(async () => {
      if (!mountedRef.current) {
        return [];
      }

      const elapsed =
        Date.now() - lastGlobalEventRequestRef.current;

      const waitTime = Math.max(
        0,
        EVENTS_REQUEST_GAP - elapsed
      );

      if (waitTime > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, waitTime)
        );
      }

      if (!mountedRef.current) {
        return [];
      }

      lastGlobalEventRequestRef.current = Date.now();

      return fetchLiveMatchEvents(matchId);
    });

    // La file continue même si une requête échoue
    eventQueueRef.current = queuedRequest.then(
      () => undefined,
      () => undefined
    );

    try {
      const events = await queuedRequest;

      if (!mountedRef.current) return;

      const previousEvents =
        previousEventsRef.current.get(matchId);

      const currentEventKeys = new Set<string>();

      for (const event of events) {
        const eventKey = getEventKey(event);

        currentEventKeys.add(eventKey);

        // Première récupération : mémoriser sans jouer de son
        if (!previousEvents) continue;

        // Événement déjà connu
        if (previousEvents.has(eventKey)) continue;

        const type = String(event.type ?? '').toLowerCase();
        const detail = String(event.detail ?? '').toLowerCase();

        // But annulé / VAR
        if (
          type === 'var' ||
          detail.includes('goal disallowed')
        ) {
          playVarSound();
        }

        // Carton jaune
        else if (
          type === 'card' &&
          detail.includes('yellow card')
        ) {
          playYellowCardSound();
        }

        // Carton rouge
        else if (
          type === 'card' &&
          detail.includes('red card')
        ) {
          playRedCardSound();
        }

        // Remplacement
        else if (type === 'subst') {
          playSubstitutionSound();
        }
      }

      previousEventsRef.current.set(
        matchId,
        currentEventKeys
      );

    } catch (err) {
      console.error(
        `Erreur événements du match ${matchId} :`,
        err
      );

      // Autoriser une nouvelle tentative après une erreur
      lastEventsCheckRef.current.delete(matchId);
    }
  }, []);

  // =====================================
  // CHARGEMENT DES MATCHS
  // =====================================

  useEffect(() => {
    mountedRef.current = true;

    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result: ApiResult<MatchesResponse> =
          await fetchMatches(controller.signal);

        if (!mountedRef.current) return;

        if (result.error) {
          setError(result.error);
        } else if (result.data) {

          // =====================================
          // DÉTECTION DES BUTS : CONSERVÉE
          // =====================================

          
        // =====================================
        // DÉTECTION DU DÉBUT ET DE LA FIN DES MATCHS
        // =====================================

          const previousStatuses = previousStatusesRef.current;

            const allStatusMatches = [
              ...result.data.live,
              ...result.data.upcoming,
              ...result.data.finished,
            ];

            allStatusMatches.forEach((match) => {
              const matchId = String(match.id);
              const currentStatus = match.statusShort;
              const previousStatus = previousStatuses.get(matchId);

              if (!currentStatus) return;

              // Première récupération : mémoriser sans jouer de son
              if (!previousStatus) {
                previousStatuses.set(matchId, currentStatus);
                return;
              }

              // Coup d'envoi
              if (
                previousStatus === 'NS' &&
                currentStatus === '1H'
              ) {
                playStartMatchSound();
              }

              // Reprise après la mi-temps
              if (
                previousStatus === 'HT' &&
                currentStatus === '2H'
              ) {
                playStartMatchSound();
              }

              // Coup de sifflet final
              if (
                ['1H', '2H', 'ET'].includes(previousStatus) &&
                ['FT', 'AET'].includes(currentStatus)
              ) {
                playEndMatchSound();
              }

              previousStatuses.set(matchId, currentStatus);
            });

          const previousScores = previousScoresRef.current;
          
          result.data.live.forEach((match) => {
            const previous = previousScores.get(
              String(match.id)
            );

            if (previous) {
              const goalScored =
                match.homeScore > previous.home ||
                match.awayScore > previous.away;

              if (goalScored) {
                playGoalSound();
              }
            }
          });

          previousScoresRef.current = new Map(
            result.data.live.map((match) => [
              String(match.id),
              {
                home: match.homeScore,
                away: match.awayScore,
              },
            ])
          );

          // =====================================
          // DÉTECTION DES AUTRES ÉVÉNEMENTS
          // EN ARRIÈRE-PLAN
          // =====================================

          if (!result.isMockData) {
            result.data.live.forEach((match) => {
              void checkMatchEvents(match);
            });
          }

          // Afficher les matchs immédiatement
          if (!mountedRef.current) return;

          setData(result.data);
          setIsMockData(result.isMockData);
        }

      } catch (err) {
        if (!mountedRef.current) return;

        if (
          !(err instanceof DOMException &&
            err.name === 'AbortError')
        ) {
          console.error('Erreur lors du chargement des matchs :', err);
           setError('Failed to load matches');
        }

      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    }

    load();

    let interval: ReturnType<typeof setInterval> | undefined;

    if (autoRefresh) {
      interval = setInterval(() => {
        if (mountedRef.current) {
          load();
        }
      }, refreshInterval * 1000);
    }

    return () => {
      mountedRef.current = false;

      controller.abort();

      if (interval) {
        clearInterval(interval);
      }
    };

  }, [
    refreshKey,
    autoRefresh,
    refreshInterval,
    checkMatchEvents,
  ]);

  // =====================================
  // RETOUR DES DONNÉES
  // =====================================

  return {
    live: data?.live ?? [],
    upcoming: data?.upcoming ?? [],
    finished: data?.finished ?? [],
    all: data
      ? [...data.live, ...data.upcoming, ...data.finished]
      : [],
    loading,
    error,
    isMockData,
    refresh,
  };
}
