import {useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, Search, Trophy } from 'lucide-react';
import { useCompetitions } from '@/lib/useCompetitions';
import { fetchCompetitionsByCountry } from '@/lib/api';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import type { Competition } from '@/types';
import LoadingState from "@/components/LoadingState";


const regions = ['Europe', 'Africa', 'Americas', 'Asia'];

export function CompetitionsPage() {
  const {
    countries,
    popularCompetitions,
    loading,
    error,
    refresh,
  } = useCompetitions();

  const [activeRegion, setActiveRegion] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  type CountryItem = { name: string; code: string };

  const [selectedCountry, setSelectedCountry] = useState<CountryItem | null>(null);
  const [countryCompetitions, setCountryCompetitions] = useState<Competition[]>([]);
  const [countryLoading, setCountryLoading] = useState(false);

  // ==========================================================
  // PAYS RÉELS
  // ==========================================================

    const realCountries = useMemo<CountryItem[]>(() => {
    const uniqueCountries = new Map<string, CountryItem>();

    for (const country of countries) {
      const name = country.name?.trim();
      const code = country.code?.trim().toUpperCase();

      if (!name || !code) {
        continue;
      }

      const key = `${code}-${name}`;

      if (!uniqueCountries.has(key)) {
        uniqueCountries.set(key, { name, code });
      }
    }

    return Array.from(uniqueCountries.values());
  }, [countries]);
  // ==========================================================
  // PAYS → RÉGION
  // ==========================================================
    const majorEuropeanCountryCodes = new Set([
    'GB-ENG',
    'ES',
    'IT',
    'DE',
    'FR',
    'NL',
    'PT',
    'BE',
    'TR',
    'GB-SCT',
    'GR',
    'AT',
    'CH',
    'DK',
    'NO',
  ]);

  const countryRegionMap = useMemo(() => {
    const map = new Map<string, string>();

    const europe = new Set([
      'AL', 'AD', 'AT', 'BE', 'BY', 'BA', 'BG', 'HR', 'CY', 'CZ',
      'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IE', 'IT',
      'XK', 'LV', 'LI', 'LT', 'LU', 'MT', 'MD', 'MC', 'ME', 'MK',
      'NL', 'NO', 'PL', 'PT', 'RO', 'RU', 'SM', 'RS', 'SK', 'SI',
      'ES', 'SE', 'CH', 'UA', 'VA', 'GB', 'GB-ENG', 'GB-SCT',
      'GB-WLS', 'GB-NIR',
    ]);

    const africa = new Set([
      'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CM', 'CV', 'CF', 'TD',
      'KM', 'CG', 'CD', 'CI', 'DJ', 'EG', 'GQ', 'ER', 'SZ', 'ET',
      'GA', 'GM', 'GH', 'GN', 'GW', 'KE', 'LS', 'LR', 'LY', 'MG',
      'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 'NA', 'NE', 'NG', 'RW',
      'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 'TZ', 'TG',
      'TN', 'UG', 'ZM', 'ZW',
    ]);

    const americas = new Set([
      'AR', 'BO', 'BR', 'CA', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC',
      'SV', 'GT', 'HT', 'HN', 'JM', 'MX', 'NI', 'PA', 'PY', 'PE',
      'PR', 'TT', 'US', 'UY', 'VE',
    ]);

    const asia = new Set([
      'AF', 'AM', 'AZ', 'BH', 'BD', 'BT', 'BN', 'KH', 'CN', 'GE',
      'HK', 'IN', 'ID', 'IR', 'IQ', 'IL', 'JP', 'JO', 'KZ', 'KW',
      'KG', 'LA', 'LB', 'MO', 'MY', 'MV', 'MN', 'MM', 'NP', 'OM',
      'PK', 'PS', 'PH', 'QA', 'SA', 'SG', 'KR', 'LK', 'SY', 'TW',
      'TJ', 'TH', 'TL', 'TM', 'AE', 'UZ', 'VN', 'YE',
    ]);

    for (const country of realCountries) {
      const code = country.code.trim().toUpperCase();

      if (europe.has(code)) {
        map.set(code, 'Europe');
      } else if (africa.has(code)) {
        map.set(code, 'Africa');
      } else if (americas.has(code)) {
        map.set(code, 'Americas');
      } else if (asia.has(code)) {
        map.set(code, 'Asia');
      }
    }

    return map;
  }, [realCountries]);

  // ==========================================================
  // PAYS FILTRÉS
  // ==========================================================

  const filteredCountries = useMemo(() => {
    let result = realCountries;

    if (activeRegion) {
      result = result.filter((country) => {
        const code = country.code?.trim().toUpperCase();

        if (countryRegionMap.get(code) !== activeRegion) {
          return false;
        }

        if (
          activeRegion === 'Europe' &&
          !majorEuropeanCountryCodes.has(code)
        ) {
          return false;
        }

        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();

      result = result.filter((country) =>
        country.name.toLowerCase().includes(q),
      );
    }

    return result;
  }, [realCountries, activeRegion, searchQuery, countryRegionMap]);

  // ==========================================================
  // COMPÉTITIONS DU PAYS SÉLECTIONNÉ
  // ==========================================================

    useEffect(() => {
    if (!selectedCountry) {
      setCountryCompetitions([]);
      return;
    }

    const controller = new AbortController();

    const loadCountryCompetitions = async () => {
      setCountryLoading(true);

      const result = await fetchCompetitionsByCountry(
        selectedCountry.name,
        controller.signal,
      );

      if (!controller.signal.aborted) {
        setCountryCompetitions(result.data ?? []);
        setCountryLoading(false);
      }
    };

    loadCountryCompetitions();

    return () => {
      controller.abort();
    };
  }, [selectedCountry]);

  const filteredCountryCompetitions = useMemo(() => {
    if (!searchQuery.trim()) {
      return countryCompetitions;
    }

    const q = searchQuery.toLowerCase();

    return countryCompetitions.filter((competition) =>
      competition.name.toLowerCase().includes(q),
    );
  }, [countryCompetitions, searchQuery]);

  // ==========================================================
  // ACTIONS
  // ==========================================================

  const handleRegionChange = (region: string) => {
    setActiveRegion(region);
    setSelectedCountry(null);
    setSearchQuery('');
  };

  const handleCountryClick = (country: CountryItem) => {
    setSelectedCountry(country);
    setSearchQuery('');
  };

  const handleBackToCountries = () => {
    setSelectedCountry(null);
    setSearchQuery('');
  };

  // ==========================================================
  // CHARGEMENT / ERREUR
  // ==========================================================

  if (loading && popularCompetitions.length === 0 && countries.length === 0) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-ndembo-text">
            Compétitions
          </h1>
          <p className="text-sm text-ndembo-muted mt-1">
            Retrouvez les principales compétitions de football
          </p>
        </div>

        <LoadingState />
      </div>
    );
  }

  if (error && popularCompetitions.length === 0 && countries.length === 0) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ndembo-text">
          Compétitions
        </h1>

        <p className="text-sm text-ndembo-muted mt-1">
          {selectedCountry
            ? `Les championnats de ${selectedCountry.name}`
            : 'Choisissez un pays pour voir ses championnats'}
        </p>
      </div>

      {/* Recherche */}
      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ndembo-muted"
        />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            selectedCountry
              ? 'Rechercher un championnat...'
              : 'Rechercher un pays...'
          }
          className="w-full bg-ndembo-card border border-ndembo-border rounded-lg pl-9 pr-4 py-2 text-sm text-ndembo-text placeholder:text-ndembo-muted focus:outline-none focus:border-ndembo-neon/50"
        />
      </div>

      {/* Sélecteur de région */}
      {!selectedCountry && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleRegionChange('')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeRegion === ''
                ? 'bg-ndembo-neon text-ndembo-bg'
                : 'bg-ndembo-card border border-ndembo-border text-ndembo-muted hover:text-ndembo-text'
            }`}
          >
            <Globe size={12} />
            Toutes
          </button>

          {regions.map((region) => (
            <button
              key={region}
              onClick={() => handleRegionChange(region)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeRegion === region
                  ? 'bg-ndembo-neon text-ndembo-bg'
                  : 'bg-ndembo-card border border-ndembo-border text-ndembo-muted hover:text-ndembo-text'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      )}

      {/* Retour aux pays */}
      {selectedCountry && (
        <button
          onClick={handleBackToCountries}
          className="inline-flex items-center gap-2 text-sm text-ndembo-muted hover:text-ndembo-neon transition-colors"
        >
          <ArrowLeft size={16} />
          Tous les pays
        </button>
      )}

      {/* ====================================================== */}
      {/* LISTE DES PAYS                                         */}
      {/* ====================================================== */}

          {!selectedCountry ? (
             loading ? (
            <LoadingState />
          ) : filteredCountries.length === 0 ? (
            <EmptyState
              icon={Globe}
              title="Aucun pays trouvé"
              description="Essayez une autre recherche."
            />
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCountries.map((country) => (
              <button
                key={`${country.code}-${country.name}`}
                onClick={() => handleCountryClick(country)}
                className="bg-ndembo-card border border-ndembo-border rounded-xl p-4 hover:border-ndembo-neon/30 hover:bg-ndembo-cardHover transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-ndembo-border/30 flex items-center justify-center overflow-hidden">
                    {country.code ? (
                      <img
                        src={`https://media.api-sports.io/flags/${country.code
                          .trim()
                          .toLowerCase()}.svg`}
                        alt={`Drapeau ${country.name}`}
                        className="w-7 h-auto object-contain"
                      />
                    ) : (
                      <Globe size={18} className="text-ndembo-muted" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ndembo-text truncate group-hover:text-ndembo-neon transition-colors">
                      {country.name}
                    </p>

                    <p className="text-xs text-ndembo-muted mt-1">
                      Voir les championnats
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )
      ) : (
        /* ==================================================== */
        /* CHAMPIONNATS DU PAYS                                */
        /* ==================================================== */

        countryLoading ? (
            <LoadingState />
          ) : filteredCountryCompetitions.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="Aucun championnat trouvé"
              description={`Aucun championnat disponible pour ${selectedCountry.name}.`}
            />
          ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCountryCompetitions.map((comp: Competition) => (
              <Link
                key={comp.id}
                to={`/competitions/${comp.id}`}
                className="bg-ndembo-card border border-ndembo-border rounded-xl p-4 hover:border-ndembo-neon/30 hover:bg-ndembo-cardHover transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-ndembo-border/30 flex items-center justify-center overflow-hidden">
                    <img
                      src={`https://media.api-sports.io/football/leagues/${comp.id}.png`}
                      alt={`Logo ${comp.name}`}
                      className="w-7 h-7 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ndembo-text truncate group-hover:text-ndembo-neon transition-colors">
                      {comp.name}
                    </p>

                    <p className="text-xs text-ndembo-muted mt-1">
                      {selectedCountry.name}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}
