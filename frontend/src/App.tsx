import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FavoritesProvider } from '@/lib/favorites';
import { SettingsProvider } from '@/lib/settings';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { MatchesPage } from '@/pages/MatchesPage';
import { MatchDetailsPage } from '@/pages/MatchDetailsPage';
import { CompetitionsPage } from '@/pages/CompetitionsPage';
import { CompetitionDetailsPage } from '@/pages/CompetitionDetailsPage';
import { StandingsPage } from '@/pages/StandingsPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { StatisticsPage } from '@/pages/StatisticsPage';
import { SearchPage } from '@/pages/SearchPage';
import { SettingsPage } from '@/pages/SettingsPage';
import TeamDetailsPage from './pages/TeamDetailsPage';



function App() {
  return (
    <SettingsProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/matches" element={<MatchesPage />} />
              <Route path="/matches/:id" element={<MatchDetailsPage />} />
              <Route path="/competitions" element={<CompetitionsPage />} />
              <Route path="/competitions/:id" element={<CompetitionDetailsPage />} />
              <Route path="/teams/:id" element={<TeamDetailsPage />} />
              <Route path="/standings" element={<StandingsPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FavoritesProvider>
    </SettingsProvider>
  );
}

export default App;
