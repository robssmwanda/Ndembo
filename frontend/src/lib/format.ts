import type { MatchStatus } from '@/types';

export function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function formatDateLong(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function isToday(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
}

export function statusLabel(status: MatchStatus): string {
  switch (status) {
    case 'live': return 'En direct';
    case 'upcoming': return 'À venir';
    case 'finished': return 'Terminé';
    default: return status;
  }
}

export function statusColor(status: MatchStatus): string {
  switch (status) {
    case 'live': return 'text-ndembo-live';
    case 'upcoming': return 'text-ndembo-accent';
    case 'finished': return 'text-ndembo-muted';
    default: return 'text-ndembo-muted';
  }
}
