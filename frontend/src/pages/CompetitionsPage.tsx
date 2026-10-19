import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Search, Globe } from 'lucide-react';
import { useCompetitions } from '@/lib/useCompetitions';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import type { Competition } from '@/types';

const regions = ['Europe', 'Africa', 'Americas', 'Asia'];

export function CompetitionsPage() {
  const {
    countries,
    popularCompetitions,
    loading,
    error,
    refresh,
  } = useCompetitions();

  /*
   * Europe est sélectionné par défaut.
   */
  const [activeRegion, setActiveRegion] = useState('Europe');
  const [searchQuery, setSearchQuery] = useState('');

  /*
   * ==========================================================
   * PAYS RÉELS
   * ==========================================================
   *
   * L'API fournit également des entrées comme :
   * WORLD, EUROPE, AFRICA, ASIA, AMERICAS, OCEANIA.
   *
   * Ce ne sont pas des pays, donc on les retire de "Toutes".
   */
  const realCountries = useMemo(() => {
    const excludedCodes = new Set([
      'WORLD',
      'EUROPE',
      'AFRICA',
      'AMERICAS',
      'ASIA',
      'OCEANIA',
    ]);

    const uniqueCountries = new Map<string, (typeof countries)[number]>();

    for (const country of countries) {
      const code = country.code?.trim().toUpperCase();

      if (!code || excludedCodes.has(code)) {
        continue;
      }

      const key = `${code}-${country.name}`;

      if (!uniqueCountries.has(key)) {
        uniqueCountries.set(key, country);
      }
    }

    return Array.from(uniqueCountries.values());
  }, [countries]);

  /*
   * ==========================================================
   * CORRESPONDANCE PAYS → RÉGION
   * ==========================================================
   *
   * On utilise le code pays provenant directement de la liste
   * des pays de l'API.
   *
   * Cela évite de dépendre uniquement du nom du pays.
   */
  const countryRegionMap = useMemo(() => {
    const map = new Map<string, string>();

    const europe = new Set([
      'AL',
      'AD',
      'AT',
      'BE',
      'BY',
      'BA',
      'BG',
      'HR',
      'CY',
      'CZ',
      'DK',
      'EE',
      'FI',
      'FR',
      'DE',
      'GR',
      'HU',
      'IS',
      'IE',
      'IT',
      'XK',
      'LV',
      'LI',
      'LT',
      'LU',
      'MT',
      'MD',
      'MC',
      'ME',
      'MK',
      'NL',
      'NO',
      'PL',
      'PT',
      'RO',
      'RU',
      'SM',
      'RS',
      'SK',
      'SI',
      'ES',
      'SE',
      'CH',
      'UA',
      'VA',
      'GB',
      'GB-ENG',
      'GB-SCT',
      'GB-WLS',
      'GB-NIR',
    ]);

    const africa = new Set([
      'DZ',
      'AO',
      'BJ',
      'BW',
      'BF',
      'BI',
      'CM',
      'CV',
      'CF',
      'TD',
      'KM',
      'CG',
      'CD',
      'CI',
      'DJ',
      'EG',
      'GQ',
      'ER',
      'SZ',
      'ET',
      'GA',
      'GM',
      'GH',
      'GN',
      'GW',
      'KE',
      'LS',
      'LR',
      'LY',
      'MG',
      'MW',
      'ML',
      'MR',
      'MU',
      'MA',
      'MZ',
      'NA',
      'NE',
      'NG',
      'RW',
      'ST',
      'SN',
      'SC',
      'SL',
      'SO',
      'ZA',
      'SS',
      'SD',
      'TZ',
      'TG',
      'TN',
      'UG',
      'ZM',
      'ZW',
    ]);

    const americas = new Set([
      'AR',
      'BO',
      'BR',
      'CA',
      'CL',
      'CO',
      'CR',
      'CU',
      'DO',
      'EC',
      'SV',
      'GT',
      'HT',
      'HN',
      'JM',
      'MX',
      'NI',
      'PA',
      'PY',
      'PE',
      'PR',
      'TT',
      'US',
      'UY',
      'VE',
    ]);

    const asia = new Set([
      'AF',
      'AM',
      'AZ',
      'BH',
      'BD',
      'BT',
      'BN',
      'KH',
      'CN',
      'GE',
      'HK',
      'IN',
      'ID',
      'IR',
      'IQ',
      'IL',
      'JP',
      'JO',
      'KZ',
      'KW',
      'KG',
      'LA',
      'LB',
      'MO',
      'MY',
      'MV',
      'MN',
      'MM',
      'NP',
      'OM',
      'PK',
      'PS',
      'PH',
      'QA',
      'SA',
      'SG',
      'KR',
      'LK',
      'SY',
      'TW',
      'TJ',
      'TH',
      'TL',
      'TM',
      'AE',
      'UZ',
      'VN',
      'YE',
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

  /*
   * ==========================================================
   * CODE PAYS D'UNE COMPÉTITION
   * ==========================================================
   *
   * L'objet Competition contient actuellement le nom du pays,
   * mais pas son code.
   *
   * On retrouve donc le code à partir du nom.
   */
const getCompetitionCountryCode = (
  competition: Competition,
) => {
  return competition.countryCode?.trim().toUpperCase();
};
  /*
   * ==========================================================
   * GRANDS CHAMPIONNATS EUROPÉENS
   * ==========================================================
   *
   * On privilégie les grands pays européens.
   */
    const majorEuropeanCountries = new Set([
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

  const europeanCompetitions = useMemo(() => {
  const seen = new Set<string>();

  return popularCompetitions
    .filter((competition) => {
      const code = getCompetitionCountryCode(competition);

      if (!code) {
        return false;
      }

      return majorEuropeanCountries.has(code);
    })
    .filter((competition) => {
      if (seen.has(competition.id)) return false;

      seen.add(competition.id);
      return true;
    })
    .slice(0, 15);
}, [
  popularCompetitions,
  realCountries,
  countryRegionMap,
]);

  /*
   * ==========================================================
   * COMPÉTITIONS PAR RÉGION
   * ==========================================================
   */
  const regionalCompetitions = useMemo(() => {
    if (activeRegion === 'Europe') {
      return europeanCompetitions;
    }

    if (
      activeRegion !== 'Africa' &&
      activeRegion !== 'Americas' &&
      activeRegion !== 'Asia'
    ) {
      return [];
    }

    const seen = new Set<string>();

    return popularCompetitions.filter((competition) => {
    const code = getCompetitionCountryCode(competition);

    if (!code) {
      return false;
    }

    const region = countryRegionMap.get(code);

    if (region !== activeRegion) {
      return false;
    }

    if (seen.has(competition.id)) {
      return false;
    }

    seen.add(competition.id);

    return true;
  });
  }, [
    activeRegion,
    popularCompetitions,
    realCountries,
    countryRegionMap,
    europeanCompetitions,
  ]);

  /*
   * ==========================================================
   * RECHERCHE DES COMPÉTITIONS
   * ==========================================================
   */
  const filteredCompetitions = useMemo(() => {
    if (!searchQuery.trim()) {
      return regionalCompetitions;
    }

    const q = searchQuery.toLowerCase();

    return regionalCompetitions.filter(
      (competition) =>
        competition.name.toLowerCase().includes(q) ||
        (competition.country || '')
          .toLowerCase()
          .includes(q),
    );
  }, [regionalCompetitions, searchQuery]);

  /*
   * ==========================================================
   * RECHERCHE DES PAYS
   * ==========================================================
   */
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) {
      return realCountries;
    }

    const q = searchQuery.toLowerCase();

    return realCountries.filter((country) =>
      country.name.toLowerCase().includes(q),
    );
  }, [realCountries, searchQuery]);

  /*
   * ==========================================================
   * CHARGEMENT
   * ==========================================================
   */
  if (loading && popularCompetitions.length === 0) {
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

        <LoadingSkeleton variant="card" count={6} />
      </div>
    );
  }

  if (error && popularCompetitions.length === 0) {
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
          Retrouvez les principales compétitions de football
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
            activeRegion === ''
              ? 'Rechercher un pays...'
              : 'Rechercher une compétition...'
          }
          className="w-full bg-ndembo-card border border-ndembo-border rounded-lg pl-9 pr-4 py-2 text-sm text-ndembo-text placeholder:text-ndembo-muted focus:outline-none focus:border-ndembo-neon/50"
        />
      </div>

      {/* Sélecteur de région */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => {
            setActiveRegion('');
            setSearchQuery('');
          }}
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
            onClick={() => {
              setActiveRegion(region);
              setSearchQuery('');
            }}
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

      {/* Toutes = tous les vrais pays */}
      {activeRegion === '' ? (
        filteredCountries.length === 0 ? (
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
                className="bg-ndembo-card border border-ndembo-border rounded-xl p-4 hover:border-ndembo-neon/30 hover:bg-ndembo-cardHover transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-ndembo-border/30 flex items-center justify-center font-bold text-ndembo-neon">
                    {country.code}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ndembo-text truncate group-hover:text-ndembo-neon transition-colors">
                      {country.name}
                    </p>

                    <p className="text-xs text-ndembo-muted mt-1">
                      Voir les compétitions
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )
      ) : (
        /* Compétitions par région */
        filteredCompetitions.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="Aucune compétition trouvée"
            description="Aucune compétition ne correspond à votre recherche ou à cette région."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCompetitions.map((comp: Competition) => (
              <Link
                key={comp.id}
                to={`/competitions/${comp.id}`}
                className="bg-ndembo-card border border-ndembo-border rounded-xl p-4 hover:border-ndembo-neon/30 hover:bg-ndembo-cardHover transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-ndembo-border/30 flex items-center justify-center font-bold text-ndembo-neon">
                    {comp.country
                      ? comp.country
                          .substring(0, 2)
                          .toUpperCase()
                      : comp.name
                          .substring(0, 2)
                          .toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ndembo-text truncate group-hover:text-ndembo-neon transition-colors">
                      {comp.name}
                    </p>

                    <p className="text-xs text-ndembo-muted mt-1">
                      {comp.country}
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