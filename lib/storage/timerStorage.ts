// IndexedDB storage for timer data using idb library

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { SolveResult, TimerSettings } from '@/types/timer';

// Database schema
interface TimerDB extends DBSchema {
  solves: {
    key: string;
    value: SolveResult;
    indexes: {
      'by-timestamp': number;
      'by-date': string;
    };
  };
}

const DB_NAME = 'interactiveCubing';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<TimerDB>> | null = null;
let dbAvailable: boolean | null = null;

/**
 * Check if IndexedDB is available
 */
function isIndexedDBAvailable(): boolean {
  if (dbAvailable !== null) return dbAvailable;
  
  if (typeof window === 'undefined') {
    dbAvailable = false;
    return false;
  }

  try {
    // Check if indexedDB exists and is accessible
    if (!window.indexedDB) {
      dbAvailable = false;
      return false;
    }
    
    // Test that we can actually use it (some browsers block it in certain contexts)
    const testDB = window.indexedDB.open('test');
    testDB.onerror = () => {
      dbAvailable = false;
    };
    
    dbAvailable = true;
    return true;
  } catch {
    dbAvailable = false;
    return false;
  }
}

/**
 * Get or create the database connection
 */
async function getDB(): Promise<IDBPDatabase<TimerDB>> {
  if (!isIndexedDBAvailable()) {
    throw new Error('IndexedDB is not available in this browser context');
  }
  
  if (!dbPromise) {
    dbPromise = openDB<TimerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create solves store
        const solveStore = db.createObjectStore('solves', { keyPath: 'id' });
        solveStore.createIndex('by-timestamp', 'timestamp');
        solveStore.createIndex('by-date', 'date');
      },
    }).catch((error) => {
      // Reset promise so we can retry
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

/**
 * Add a new solve result
 */
export async function addSolve(solve: SolveResult): Promise<void> {
  const db = await getDB();
  await db.add('solves', solve);
}

/**
 * Update an existing solve (e.g., add penalty)
 */
export async function updateSolve(solve: SolveResult): Promise<void> {
  const db = await getDB();
  await db.put('solves', solve);
}

/**
 * Delete a solve by ID
 */
export async function deleteSolve(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('solves', id);
}

/**
 * Get a solve by ID
 */
export async function getSolve(id: string): Promise<SolveResult | undefined> {
  const db = await getDB();
  return db.get('solves', id);
}

/**
 * Get all solves sorted by timestamp (oldest first)
 */
export async function getAllSolves(): Promise<SolveResult[]> {
  const db = await getDB();
  return db.getAllFromIndex('solves', 'by-timestamp');
}

/**
 * Get solves within a date range
 */
export async function getSolvesByDateRange(
  startDate: string,
  endDate: string
): Promise<SolveResult[]> {
  const db = await getDB();
  const range = IDBKeyRange.bound(startDate, endDate);
  return db.getAllFromIndex('solves', 'by-date', range);
}

/**
 * Get solves from the last N days
 */
export async function getRecentSolves(days: number): Promise<SolveResult[]> {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  return getSolvesByDateRange(startDate, endDate);
}

/**
 * Get the most recent N solves
 */
export async function getLastNSolves(n: number): Promise<SolveResult[]> {
  const all = await getAllSolves();
  return all.slice(-n);
}

/**
 * Get total count of solves
 */
export async function getSolveCount(): Promise<number> {
  const db = await getDB();
  return db.count('solves');
}

/**
 * Clear all solves (use with caution!)
 */
export async function clearAllSolves(): Promise<void> {
  const db = await getDB();
  await db.clear('solves');
}

/**
 * Import multiple solves at once (batch operation)
 */
export async function importSolves(solves: SolveResult[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('solves', 'readwrite');

  await Promise.all([
    ...solves.map(solve => tx.store.add(solve)),
    tx.done,
  ]);
}

// Settings storage using localStorage (simpler for small data)

const SETTINGS_KEY = 'timer_settings';

const DEFAULT_SETTINGS: TimerSettings = {
  holdTime: 500,
  displayPrecision: 2,
  showScramble: true,
  hideTimeWhileRunning: false,
  visualizationMode: 'net2d',
  showVisualization: true,
};

/**
 * Get timer settings from localStorage
 */
export function getSettings(): TimerSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_SETTINGS;
}

/**
 * Save timer settings to localStorage
 */
export function saveSettings(settings: TimerSettings): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Export all data as JSON (for backup)
 */
export async function exportAllData(): Promise<string> {
  const solves = await getAllSolves();
  const settings = getSettings();

  return JSON.stringify({
    solves,
    settings,
    exportedAt: new Date().toISOString(),
    version: 1,
  }, null, 2);
}
