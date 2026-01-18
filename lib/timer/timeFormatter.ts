// Time formatting utilities

import { PenaltyType, ComputedTime, SolveResult } from '@/types/timer';

/**
 * Format milliseconds to display string (e.g., "1:23.45" or "45.67")
 */
export function formatTime(ms: number, precision: 2 | 3 = 2): string {
  if (ms < 0) return 'DNF';

  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}:${seconds.toFixed(precision).padStart(precision + 3, '0')}`;
  }
  return seconds.toFixed(precision);
}

/**
 * Format a solve result with penalty indicator
 */
export function formatSolveTime(time: number, penalty: PenaltyType, precision: 2 | 3 = 2): string {
  if (penalty === -1) return 'DNF';

  const effectiveTime = time + penalty;
  const formatted = formatTime(effectiveTime, precision);

  if (penalty === 2000) {
    return `${formatted}+`;
  }
  return formatted;
}

/**
 * Convert SolveResult to ComputedTime
 */
export function toComputedTime(solve: SolveResult): ComputedTime {
  const effective = solve.penalty === -1 ? Infinity : solve.time + solve.penalty;

  return {
    raw: solve.time,
    penalty: solve.penalty,
    effective,
    formatted: formatSolveTime(solve.time, solve.penalty),
    id: solve.id,
  };
}

/**
 * Parse time string back to milliseconds (e.g., "1:23.45" -> 83450)
 */
export function parseTime(timeStr: string): number | null {
  if (timeStr === 'DNF') return null;

  // Remove any penalty indicator
  const cleanStr = timeStr.replace('+', '');

  // Check for minutes format (M:SS.xx)
  const minutesMatch = cleanStr.match(/^(\d+):(\d+\.?\d*)$/);
  if (minutesMatch) {
    const minutes = parseInt(minutesMatch[1], 10);
    const seconds = parseFloat(minutesMatch[2]);
    return Math.round((minutes * 60 + seconds) * 1000);
  }

  // Seconds only format (SS.xx)
  const seconds = parseFloat(cleanStr);
  if (!isNaN(seconds)) {
    return Math.round(seconds * 1000);
  }

  return null;
}

/**
 * Format milliseconds to seconds for charts
 */
export function msToSeconds(ms: number): number {
  return ms / 1000;
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a timestamp for display with time
 */
export function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp * 1000);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Get ISO date string (YYYY-MM-DD) from timestamp
 */
export function getDateString(timestamp: number): string {
  const d = new Date(timestamp * 1000);
  return d.toISOString().split('T')[0];
}

/**
 * Generate a UUID
 */
export function generateId(): string {
  return crypto.randomUUID();
}
