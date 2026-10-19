import { useCallback, useEffect, useState } from "react";
import type { Competition } from "@/types";
import { fetchPopularCompetitions } from "./api";

export function useCompetitions() {
  const [countries, setCountries] = useState<any[]>([]);
  const [popularCompetitions, setPopularCompetitions] = useState<
    Competition[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCompetitions = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        const popularResult = await fetchPopularCompetitions(signal);

        if (popularResult.error) {
          throw new Error(popularResult.error);
        }

        setPopularCompetitions(popularResult.data ?? []);

        // Pour l'instant, on ne recharge plus /countries.
        // Cela évite un appel API supplémentaire.
        setCountries([]);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Impossible de récupérer les compétitions.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();

    loadCompetitions(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadCompetitions]);

  const refresh = useCallback(() => {
    loadCompetitions();
  }, [loadCompetitions]);

  return {
    countries,
    popularCompetitions,
    loading,
    error,
    refresh,
  };
}