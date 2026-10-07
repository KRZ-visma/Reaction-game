export type RoundDurationSeconds = 60 | 120;

export type GamePhase =
  | 'setup'
  | 'camera'
  | 'detecting'
  | 'countdown'
  | 'playing'
  | 'finished';

export const ROUND_DURATIONS: RoundDurationSeconds[] = [60, 120];

export function isRoundDuration(value: number): value is RoundDurationSeconds {
  return value === 60 || value === 120;
}

export function formatDurationLabel(seconds: RoundDurationSeconds): string {
  return seconds === 60 ? '1 minuut' : '2 minuten';
}

export function formatClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
