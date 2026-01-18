// Statistics calculations for speedcubing times

import {
  SolveResult,
  ComputedTime,
  AverageResult,
  SessionStats,
  DailyAverage
} from '@/types/timer';
import { toComputedTime } from './timeFormatter';

/**
 * Calculate average of N times with best and worst trimmed
 * This is the standard WCA average calculation
 */
export function calculateAverageOfN(times: ComputedTime[], n: number): AverageResult | null {
  if (times.length < n) return null;

  // Take the last N times
  const window = times.slice(-n);

  // Sort by effective time (DNFs sort to end with Infinity)
  const sorted = [...window].sort((a, b) => a.effective - b.effective);

  // Count DNFs
  const dnfCount = sorted.filter(t => t.penalty === -1).length;

  // More than one DNF in ao5 or more than 1 DNF per 5 times = DNF average
  const maxDNFs = n === 5 ? 1 : Math.floor(n / 5);
  if (dnfCount > maxDNFs) {
    return {
      value: -1,
      times: window,
      best: sorted[0],
      worst: sorted[sorted.length - 1],
      isDNF: true,
    };
  }

  // Trim best and worst
  const trimCount = n === 5 ? 1 : Math.max(1, Math.floor(n / 10));
  const middle = sorted.slice(trimCount, sorted.length - trimCount);

  // Calculate mean of middle times
  const sum = middle.reduce((acc, t) => acc + t.effective, 0);
  const avg = Math.round(sum / middle.length);

  return {
    value: avg,
    times: window,
    best: sorted[0],
    worst: sorted[sorted.length - 1],
    isDNF: false,
  };
}

/**
 * Calculate ao5 (average of 5)
 */
export function calculateAo5(times: ComputedTime[]): AverageResult | null {
  return calculateAverageOfN(times, 5);
}

/**
 * Calculate ao12 (average of 12)
 */
export function calculateAo12(times: ComputedTime[]): AverageResult | null {
  return calculateAverageOfN(times, 12);
}

/**
 * Calculate ao50
 */
export function calculateAo50(times: ComputedTime[]): AverageResult | null {
  return calculateAverageOfN(times, 50);
}

/**
 * Calculate ao100
 */
export function calculateAo100(times: ComputedTime[]): AverageResult | null {
  return calculateAverageOfN(times, 100);
}

/**
 * Calculate rolling average for chart display
 * Returns array of {index, value} for each valid window
 */
export function calculateRollingAverage(
  times: ComputedTime[],
  windowSize: number
): { index: number; value: number }[] {
  const results: { index: number; value: number }[] = [];

  for (let i = windowSize - 1; i < times.length; i++) {
    const window = times.slice(i - windowSize + 1, i + 1);
    const avg = calculateAverageOfN(window, windowSize);

    if (avg && !avg.isDNF) {
      results.push({
        index: i,
        value: avg.value,
      });
    }
  }

  return results;
}

/**
 * Calculate mean of all non-DNF times
 */
export function calculateMean(times: ComputedTime[]): number | null {
  const validTimes = times.filter(t => t.penalty !== -1);
  if (validTimes.length === 0) return null;

  const sum = validTimes.reduce((acc, t) => acc + t.effective, 0);
  return Math.round(sum / validTimes.length);
}

/**
 * Find best time (excluding DNFs)
 */
export function findBest(times: ComputedTime[]): ComputedTime | null {
  const validTimes = times.filter(t => t.penalty !== -1);
  if (validTimes.length === 0) return null;

  return validTimes.reduce((best, t) =>
    t.effective < best.effective ? t : best
  );
}

/**
 * Find worst time (including DNFs as worst)
 */
export function findWorst(times: ComputedTime[]): ComputedTime | null {
  if (times.length === 0) return null;

  return times.reduce((worst, t) =>
    t.effective > worst.effective ? t : worst
  );
}

/**
 * Calculate complete session statistics
 */
export function calculateSessionStats(solves: SolveResult[]): SessionStats {
  const times = solves.map(toComputedTime);

  return {
    count: times.length,
    best: findBest(times),
    worst: findWorst(times),
    mean: calculateMean(times),
    ao5: calculateAo5(times),
    ao12: calculateAo12(times),
    ao50: calculateAo50(times),
    ao100: calculateAo100(times),
  };
}

/**
 * Group solves by day and calculate daily statistics
 */
export function calculateDailyAverages(solves: SolveResult[]): DailyAverage[] {
  // Group by date
  const byDate = new Map<string, SolveResult[]>();

  for (const solve of solves) {
    const existing = byDate.get(solve.date) || [];
    existing.push(solve);
    byDate.set(solve.date, existing);
  }

  // Calculate stats for each day
  const dailyStats: DailyAverage[] = [];

  for (const [date, daySolves] of byDate) {
    const times = daySolves.map(toComputedTime);
    const validTimes = times.filter(t => t.penalty !== -1);

    if (validTimes.length === 0) continue;

    const mean = validTimes.reduce((sum, t) => sum + t.effective, 0) / validTimes.length;
    const best = Math.min(...validTimes.map(t => t.effective));

    // Calculate best ao5 of the day
    let bestAo5: number | null = null;
    if (times.length >= 5) {
      for (let i = 4; i < times.length; i++) {
        const ao5 = calculateAo5(times.slice(0, i + 1));
        if (ao5 && !ao5.isDNF) {
          if (bestAo5 === null || ao5.value < bestAo5) {
            bestAo5 = ao5.value;
          }
        }
      }
    }

    // Calculate best ao12 of the day
    let bestAo12: number | null = null;
    if (times.length >= 12) {
      for (let i = 11; i < times.length; i++) {
        const ao12 = calculateAo12(times.slice(0, i + 1));
        if (ao12 && !ao12.isDNF) {
          if (bestAo12 === null || ao12.value < bestAo12) {
            bestAo12 = ao12.value;
          }
        }
      }
    }

    dailyStats.push({
      date,
      count: daySolves.length,
      mean: Math.round(mean),
      ao5: bestAo5,
      ao12: bestAo12,
      best,
    });
  }

  // Sort by date
  return dailyStats.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate chart data points for progress visualization
 */
export function calculateChartData(
  solves: SolveResult[],
  dateRange: '7d' | '30d' | 'all'
): { times: ComputedTime[]; ao5Points: { index: number; value: number }[]; dailyAverages: DailyAverage[] } {
  // Filter by date range
  const now = Date.now();
  const msInDay = 24 * 60 * 60 * 1000;
  let cutoff = 0;

  if (dateRange === '7d') {
    cutoff = now - 7 * msInDay;
  } else if (dateRange === '30d') {
    cutoff = now - 30 * msInDay;
  }

  const filteredSolves = cutoff > 0
    ? solves.filter(s => s.timestamp * 1000 >= cutoff)
    : solves;

  const times = filteredSolves.map(toComputedTime);
  const ao5Points = calculateRollingAverage(times, 5);
  const dailyAverages = calculateDailyAverages(filteredSolves);

  return { times, ao5Points, dailyAverages };
}
