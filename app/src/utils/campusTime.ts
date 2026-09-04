import type { Campus } from './types';

export function getCampusById(campuses: Campus[], id: string) {
  return campuses.find((c) => c.id === id) ?? campuses[0];
}

/** Parse HH:mm into today's Date; if already past, roll to tomorrow. */
export function getNextCutoffDate(cutoffTime: string, now = new Date()): Date {
  const [h, m] = cutoffTime.split(':').map(Number);
  const target = new Date(now);
  target.setHours(h || 0, m || 0, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatClockLabel(time: string): string {
  const [hRaw, mRaw] = time.split(':').map(Number);
  const h = hRaw || 0;
  const m = mRaw || 0;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}
