import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchMatches, type ApiResult } from '@/lib/api';
import type { MatchesResponse, Match } from '@/types';

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

export function useMatches(autoRefresh = false, refreshInterval = 30): UseMatchesResult {
  const [data, setData] = useState<MatchesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const mountedRef = useRef(true);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    mountedRef.current = true;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result: ApiResult<MatchesResponse> = await fetchMatches(controller.signal);
        if (!mountedRef.current) return;
        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setData(result.data);
          setIsMockData(result.isMockData);
        }
      } catch (err) {
        if (!mountedRef.current) return;
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          setError('Failed to load matches');
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }

    load();

    let interval: ReturnType<typeof setInterval> | undefined;
    if (autoRefresh) {
      interval = setInterval(() => {
        if (mountedRef.current) load();
      }, refreshInterval * 1000);
    }

    return () => {
      mountedRef.current = false;
      controller.abort();
      if (interval) clearInterval(interval);
    };
  }, [refreshKey, autoRefresh, refreshInterval]);

  return {
    live: data?.live ?? [],
    upcoming: data?.upcoming ?? [],
    finished: data?.finished ?? [],
    all: data ? [...data.live, ...data.upcoming, ...data.finished] : [],
    loading,
    error,
    isMockData,
    refresh,
  };
}
