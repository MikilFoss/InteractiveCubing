// csTimer import/export functionality

import {
  SolveResult,
  CsTimerExport,
  CsTimerSolve,
  PenaltyType,
  ImportConfig
} from '@/types/timer';
import { generateId, getDateString } from '@/lib/timer/timeFormatter';

/**
 * Check if a value is a csTimer solve array
 */
function isCsTimerSolve(value: unknown): value is CsTimerSolve {
  if (!Array.isArray(value) || value.length < 4) return false;

  const [timeData, scramble, comment, timestamp] = value;

  return (
    Array.isArray(timeData) &&
    timeData.length >= 2 &&
    typeof timeData[0] === 'number' &&
    typeof timeData[1] === 'number' &&
    typeof scramble === 'string' &&
    typeof comment === 'string' &&
    typeof timestamp === 'number'
  );
}

/**
 * Convert csTimer penalty to our penalty type
 */
function convertPenalty(csPenalty: number): PenaltyType {
  if (csPenalty === -1) return -1;      // DNF
  if (csPenalty === 2000) return 2000;  // +2
  return 0;                              // Normal
}

/**
 * Parse a csTimer export JSON string
 */
export function parseCsTimerExport(jsonString: string): CsTimerSolve[] {
  try {
    const data: CsTimerExport = JSON.parse(jsonString);
    const allSolves: CsTimerSolve[] = [];

    // Iterate through all session keys (session1, session2, etc.)
    for (const [key, value] of Object.entries(data)) {
      // Skip properties object
      if (key === 'properties') continue;

      // Check if this is a session array
      if (Array.isArray(value)) {
        for (const solve of value) {
          if (isCsTimerSolve(solve)) {
            allSolves.push(solve);
          }
        }
      }
    }

    // Sort by timestamp
    allSolves.sort((a, b) => a[3] - b[3]);

    return allSolves;
  } catch (error) {
    console.error('Failed to parse csTimer export:', error);
    throw new Error('Invalid csTimer export format');
  }
}

/**
 * Convert csTimer solves to our format with original timestamps
 */
export function convertCsTimerSolves(solves: CsTimerSolve[]): SolveResult[] {
  return solves.map(solve => {
    const [timeData, scramble, comment, timestamp] = solve;
    const [penalty, time] = timeData;

    return {
      id: generateId(),
      time,
      penalty: convertPenalty(penalty),
      scramble,
      comment: comment || undefined,
      timestamp,
      date: getDateString(timestamp),
    };
  });
}

/**
 * Convert csTimer solves with timestamps distributed evenly from a start date
 */
export function convertWithDistribution(
  solves: CsTimerSolve[],
  config: ImportConfig
): SolveResult[] {
  if (solves.length === 0) return [];

  const startTime = config.startDate.getTime();
  const endTime = Date.now();
  const totalDuration = endTime - startTime;

  // Calculate interval between each solve
  const interval = solves.length > 1
    ? totalDuration / (solves.length - 1)
    : 0;

  return solves.map((solve, index) => {
    const [timeData, scramble, comment] = solve;
    const [penalty, time] = timeData;

    // Calculate new timestamp based on distribution
    const newTimestamp = Math.floor((startTime + index * interval) / 1000);

    return {
      id: generateId(),
      time,
      penalty: convertPenalty(penalty),
      scramble,
      comment: comment || undefined,
      timestamp: newTimestamp,
      date: getDateString(newTimestamp),
    };
  });
}

/**
 * Import csTimer data with configuration
 */
export function importCsTimerData(
  jsonString: string,
  config: ImportConfig
): SolveResult[] {
  const csTimerSolves = parseCsTimerExport(jsonString);

  if (config.distributeEvenly) {
    return convertWithDistribution(csTimerSolves, config);
  } else {
    return convertCsTimerSolves(csTimerSolves);
  }
}

/**
 * Preview import - returns count and date range info
 */
export function previewImport(jsonString: string): {
  count: number;
  originalDateRange: { start: Date; end: Date } | null;
  sessions: number;
} {
  try {
    const data: CsTimerExport = JSON.parse(jsonString);
    let count = 0;
    let sessions = 0;
    let minTimestamp = Infinity;
    let maxTimestamp = -Infinity;

    for (const [key, value] of Object.entries(data)) {
      if (key === 'properties') continue;

      if (Array.isArray(value) && value.length > 0) {
        sessions++;
        for (const solve of value) {
          if (isCsTimerSolve(solve)) {
            count++;
            minTimestamp = Math.min(minTimestamp, solve[3]);
            maxTimestamp = Math.max(maxTimestamp, solve[3]);
          }
        }
      }
    }

    return {
      count,
      originalDateRange: count > 0 ? {
        start: new Date(minTimestamp * 1000),
        end: new Date(maxTimestamp * 1000),
      } : null,
      sessions,
    };
  } catch {
    return { count: 0, originalDateRange: null, sessions: 0 };
  }
}

/**
 * Export our solves to csTimer format
 */
export function exportToCsTimerFormat(solves: SolveResult[]): string {
  const csTimerSolves: CsTimerSolve[] = solves.map(solve => [
    [solve.penalty, solve.time],
    solve.scramble,
    solve.comment || '',
    solve.timestamp,
  ]);

  const exportData: CsTimerExport = {
    session1: csTimerSolves,
    properties: {
      sessionData: JSON.stringify({
        '1': {
          name: 1,
          opt: {},
          rank: 1,
          stat: [solves.length, 1, -1],
        },
      }),
    },
  };

  return JSON.stringify(exportData);
}
