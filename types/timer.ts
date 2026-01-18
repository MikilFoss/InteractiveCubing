// Timer-related type definitions

// Penalty types matching csTimer format
export type PenaltyType = 0 | 2000 | -1; // 0 = normal, 2000 = +2, -1 = DNF

// Individual solve result stored in IndexedDB
export interface SolveResult {
  id: string;              // UUID
  time: number;            // Time in milliseconds
  penalty: PenaltyType;    // Penalty applied
  scramble: string;        // Scramble string
  comment?: string;        // Optional comment
  timestamp: number;       // Unix timestamp in seconds
  date: string;            // ISO date string YYYY-MM-DD for grouping
}

// Computed time with effective time including penalty
export interface ComputedTime {
  raw: number;             // Raw time in ms
  penalty: PenaltyType;
  effective: number;       // time + penalty (or Infinity for DNF)
  formatted: string;       // Display string "12.34" or "12.34+" or "DNF"
  id: string;              // Reference to solve ID
}

// Result of an average calculation (ao5, ao12, etc.)
export interface AverageResult {
  value: number;           // Average time in ms (-1 for DNF)
  times: ComputedTime[];   // Times included in average
  best: ComputedTime;      // Best time in window (trimmed)
  worst: ComputedTime;     // Worst time in window (trimmed)
  isDNF: boolean;          // Whether the average is DNF
}

// Daily statistics for charting
export interface DailyAverage {
  date: string;            // ISO date (YYYY-MM-DD)
  count: number;           // Number of solves
  mean: number;            // Mean time in ms
  ao5: number | null;      // Best ao5 of the day
  ao12: number | null;     // Best ao12 of the day
  best: number;            // Best single of the day
}

// Session statistics snapshot
export interface SessionStats {
  count: number;
  best: ComputedTime | null;
  worst: ComputedTime | null;
  mean: number | null;     // Mean of all non-DNF times
  ao5: AverageResult | null;
  ao12: AverageResult | null;
  ao50: AverageResult | null;
  ao100: AverageResult | null;
}

// Timer state machine states
export type TimerState =
  | 'idle'         // Waiting for input
  | 'ready'        // Holding spacebar, ready to start
  | 'running'      // Timer is running
  | 'stopped';     // Timer stopped, showing result

// Timer context for the hook
export interface TimerContext {
  state: TimerState;
  startTime: number | null;
  currentTime: number;
  currentScramble: string;
  lastResult: SolveResult | null;
}

// Timer settings stored in localStorage
export interface TimerSettings {
  holdTime: number;        // ms to hold before ready (default 300)
  displayPrecision: 2 | 3; // Decimal places
  showScramble: boolean;
  hideTimeWhileRunning: boolean;
}

// csTimer export format types
export interface CsTimerExport {
  [key: string]: CsTimerSolve[] | CsTimerProperties;
}

// csTimer solve format: [[penalty, time_ms], scramble, comment, timestamp]
export type CsTimerSolve = [
  [number, number],  // [penalty, time in ms]
  string,            // scramble
  string,            // comment
  number             // unix timestamp (seconds)
];

export interface CsTimerProperties {
  sessionData?: string;
  [key: string]: unknown;
}

// Import configuration
export interface ImportConfig {
  startDate: Date;         // "Cubing start date"
  distributeEvenly: boolean; // Spread times from startDate to now
}

// Chart data point
export interface ChartDataPoint {
  date: string;
  timestamp: number;
  time?: number;           // Individual time in seconds
  ao5?: number;            // ao5 in seconds
  ao12?: number;           // ao12 in seconds
  dailyMean?: number;      // Daily mean in seconds
}

// Date range options for charts
export type DateRange = '7d' | '30d' | 'all';
