import { useCallback, useEffect, useState } from "react";
import type { Competition } from "@/types";
import { fetchPopularCompetitions, fetchCountries } from "./api";

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
        const [popularResult, countriesResult] = await Promise.all([
          fetchPopularCompetitions(signal),
          fetchCountries(signal),
        ]);

        if (popularResult.error) {
          throw new Error(popularResult.error);
        }

        if (countriesResult.error) {
          throw new Error(countriesResult.error);
        }

        // Ne pas mettre à jour l'état si la requête a été annulée
        if (signal?.aborted) {
          return;
        }

        setPopularCompetitions(popularResult.data ?? []);
        setCountries(countriesResult.data ?? []);
      } catch (err) {
        // Une requête annulée n'est pas une vraie erreur
        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          return;
        }

        if (!signal?.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de récupérer les compétitions.",
          );
        }
      } finally {
        // Une requête annulée ne doit pas arrêter le loading
        if (!signal?.aborted) {
          setLoading(false);
        }
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