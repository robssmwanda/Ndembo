import { Settings as SettingsIcon, Moon, Sun, Globe, Bell, RefreshCw, RotateCcw, Monitor } from 'lucide-react';
import { useSettings, type Language, type ThemeMode } from '@/lib/settings';

export function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();

  const languages: { value: Language; label: string; flag: string }[] = [
    { value: 'fr', label: 'Français', flag: 'FR' },
    { value: 'en', label: 'English', flag: 'EN' },
  ];

  const themes: { value: ThemeMode; label: string; icon: typeof Moon }[] = [
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'light', label: 'Clair', icon: Sun },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-bold text-ndembo-text">Paramètres</h1>

      {/* Theme */}
      <section className="bg-ndembo-card border border-ndembo-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <SettingsIcon size={16} className="text-ndembo-neon" />
          <h2 className="text-sm font-semibold text-ndembo-text">Thème</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {themes.map(theme => {
            const Icon = theme.icon;
            const active = settings.theme === theme.value;
            return (
              <button
                key={theme.value}
                onClick={() => updateSettings({ theme: theme.value })}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  active
                    ? 'border-ndembo-neon bg-ndembo-neon/10'
                    : 'border-ndembo-border bg-ndembo-bg/30 hover:border-ndembo-border/80'
                }`}
              >
                <Icon size={18} className={active ? 'text-ndembo-neon' : 'text-ndembo-muted'} />
                <span className={`text-sm font-medium ${active ? 'text-ndembo-neon' : 'text-ndembo-text'}`}>{theme.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Language */}
      <section className="bg-ndembo-card border border-ndembo-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={16} className="text-ndembo-neon" />
          <h2 className="text-sm font-semibold text-ndembo-text">Langue</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {languages.map(lang => {
            const active = settings.language === lang.value;
            return (
              <button
                key={lang.value}
                onClick={() => updateSettings({ language: lang.value })}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  active
                    ? 'border-ndembo-neon bg-ndembo-neon/10'
                    : 'border-ndembo-border bg-ndembo-bg/30 hover:border-ndembo-border/80'
                }`}
              >
                <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${active ? 'bg-ndembo-neon text-ndembo-bg' : 'bg-ndembo-border text-ndembo-muted'}`}>
                  {lang.flag}
                </span>
                <span className={`text-sm font-medium ${active ? 'text-ndembo-neon' : 'text-ndembo-text'}`}>{lang.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Display Preferences */}
      <section className="bg-ndembo-card border border-ndembo-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Monitor size={16} className="text-ndembo-neon" />
          <h2 className="text-sm font-semibold text-ndembo-text">Affichage</h2>
        </div>
        <div className="space-y-4">
          <ToggleRow
            label="Mode compact"
            description="Affiche les matchs et tableaux en format réduit pour gagner de l'espace."
            value={settings.compactMode}
            onChange={(v) => updateSettings({ compactMode: v })}
          />
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-ndembo-card border border-ndembo-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={16} className="text-ndembo-neon" />
          <h2 className="text-sm font-semibold text-ndembo-text">Notifications</h2>
        </div>
        <div className="space-y-4">
          <ToggleRow
            label="Alertes des matchs en direct"
            description="Recevoir une notification quand un match favori commence ou marque un but."
            value={settings.liveNotifications}
            onChange={(v) => updateSettings({ liveNotifications: v })}
          />
          <ToggleRow
            label="Rappels de matchs"
            description="Recevoir un rappel avant le début d'un match favori."
            value={settings.matchReminders}
            onChange={(v) => updateSettings({ matchReminders: v })}
          />
        </div>
      </section>

      {/* Data Refresh */}
      <section className="bg-ndembo-card border border-ndembo-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw size={16} className="text-ndembo-neon" />
          <h2 className="text-sm font-semibold text-ndembo-text">Actualisation des données</h2>
        </div>
        <div className="space-y-4">
          <ToggleRow
            label="Actualisation automatique"
            description="Rafraîchir automatiquement les scores des matchs en direct."
            value={settings.autoRefresh}
            onChange={(v) => updateSettings({ autoRefresh: v })}
          />
          {settings.autoRefresh && (
            <div>
              <label className="text-sm text-ndembo-text block mb-2">Intervalle d'actualisation</label>
              <div className="flex items-center gap-2 flex-wrap">
                {[10, 15, 30, 60, 120].map(sec => (
                  <button
                    key={sec}
                    onClick={() => updateSettings({ refreshInterval: sec })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      settings.refreshInterval === sec
                        ? 'bg-ndembo-neon text-ndembo-bg'
                        : 'bg-ndembo-bg/30 border border-ndembo-border text-ndembo-muted hover:text-ndembo-text'
                    }`}
                  >
                    {sec < 60 ? `${sec}s` : `${sec / 60}min`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Reset */}
      <div className="flex items-center justify-between bg-ndembo-card border border-ndembo-border rounded-xl p-4">
        <div>
          <p className="text-sm font-semibold text-ndembo-text">Réinitialiser les paramètres</p>
          <p className="text-xs text-ndembo-muted mt-0.5">Restaure tous les paramètres à leurs valeurs par défaut.</p>
        </div>
        <button
          onClick={resetSettings}
          className="flex items-center gap-1.5 text-xs text-ndembo-live hover:text-ndembo-liveDim border border-ndembo-live/30 hover:border-ndembo-live/50 px-3 py-2 rounded-lg transition-colors"
        >
          <RotateCcw size={12} />
          Réinitialiser
        </button>
      </div>

      <p className="text-xs text-ndembo-muted text-center">
        Les paramètres sont sauvegardés dans votre navigateur. Aucun compte n'est requis.
      </p>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm text-ndembo-text">{label}</p>
        <p className="text-xs text-ndembo-muted mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 mt-0.5 ${
          value ? 'bg-ndembo-neon' : 'bg-ndembo-border'
        }`}
        aria-label={label}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-ndembo-bg transition-transform ${
            value ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
