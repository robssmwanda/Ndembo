import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { RightSidebar } from '@/components/RightSidebar';
import { useMatches } from '@/lib/useMatches';
import { useSettings } from '@/lib/settings';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { settings } = useSettings();
  const { all } = useMatches(false, settings.refreshInterval);

  // Close sidebar on route change (handled by location change)
  useEffect(() => {
    setSidebarOpen(false);
  }, []);

  // Derive competitions from matches
  const competitionsMap = new Map<string, typeof all[number]['competition']>();
  all.forEach(m => {
    if (!competitionsMap.has(m.competition.id)) {
      competitionsMap.set(m.competition.id, m.competition);
    }
  });
  const competitions = Array.from(competitionsMap.values());

  return (
    <div className="flex min-h-screen bg-ndembo-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex flex-1 gap-6 px-4 lg:px-6 py-6">
          <main className="flex-1 min-w-0">
            <Outlet context={{ competitions }} />
          </main>
          <RightSidebar competitions={competitions} />
        </div>
      </div>
    </div>
  );
}
