// IndexedDB storage for training data

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { 
  AlgorithmProgress, 
  TrainingSession,
  createInitialProgress 
} from '@/lib/training/sm2';

// Database schema
interface TrainingDB extends DBSchema {
  progress: {
    key: number; // caseId
    value: AlgorithmProgress;
    indexes: {
      'by-next-review': string;
    };
  };
  sessions: {
    key: string; // date
    value: TrainingSession;
    indexes: {
      'by-date': string;
    };
  };
}

const DB_NAME = 'interactiveCubingTraining';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<TrainingDB>> | null = null;

/**
 * Check if IndexedDB is available
 */
function isIndexedDBAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    return !!window.indexedDB;
  } catch {
    return false;
  }
}

/**
 * Get or create the database connection
 */
async function getDB(): Promise<IDBPDatabase<TrainingDB>> {
  if (!isIndexedDBAvailable()) {
    throw new Error('IndexedDB is not available');
  }
  
  if (!dbPromise) {
    dbPromise = openDB<TrainingDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create progress store
        const progressStore = db.createObjectStore('progress', { keyPath: 'caseId' });
        progressStore.createIndex('by-next-review', 'nextReviewDate');
        
        // Create sessions store
        const sessionsStore = db.createObjectStore('sessions', { keyPath: 'date' });
        sessionsStore.createIndex('by-date', 'date');
      },
    }).catch((error) => {
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

/**
 * Get progress for a specific algorithm case
 */
export async function getProgress(caseId: number): Promise<AlgorithmProgress | undefined> {
  const db = await getDB();
  return db.get('progress', caseId);
}

/**
 * Get all progress records
 */
export async function getAllProgress(): Promise<AlgorithmProgress[]> {
  const db = await getDB();
  return db.getAll('progress');
}

/**
 * Get or create progress for a case
 */
export async function getOrCreateProgress(caseId: number): Promise<AlgorithmProgress> {
  const existing = await getProgress(caseId);
  if (existing) return existing;
  
  const newProgress = createInitialProgress(caseId);
  await saveProgress(newProgress);
  return newProgress;
}

/**
 * Save/update progress for an algorithm
 */
export async function saveProgress(progress: AlgorithmProgress): Promise<void> {
  const db = await getDB();
  await db.put('progress', progress);
}

/**
 * Initialize progress for all cases (if not already initialized)
 */
export async function initializeAllProgress(caseIds: number[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('progress', 'readwrite');
  
  for (const caseId of caseIds) {
    const existing = await tx.store.get(caseId);
    if (!existing) {
      await tx.store.add(createInitialProgress(caseId));
    }
  }
  
  await tx.done;
}

/**
 * Get algorithms due for review, sorted by priority
 */
export async function getDueAlgorithms(): Promise<AlgorithmProgress[]> {
  const db = await getDB();
  const today = new Date().toISOString().split('T')[0];
  const range = IDBKeyRange.upperBound(today, false);
  return db.getAllFromIndex('progress', 'by-next-review', range);
}

/**
 * Record a training session
 */
export async function recordSession(session: TrainingSession): Promise<void> {
  const db = await getDB();
  
  // Get or create today's session
  const existing = await db.get('sessions', session.date);
  if (existing) {
    // Merge with existing session
    const merged: TrainingSession = {
      ...existing,
      algorithmsReviewed: existing.algorithmsReviewed + session.algorithmsReviewed,
      masteredCount: session.masteredCount, // Use latest count
    };
    await db.put('sessions', merged);
  } else {
    await db.add('sessions', session);
  }
}

/**
 * Get training sessions for the last N days
 */
export async function getRecentSessions(days: number): Promise<TrainingSession[]> {
  const db = await getDB();
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  
  const range = IDBKeyRange.bound(startDate, endDate);
  return db.getAllFromIndex('sessions', 'by-date', range);
}

/**
 * Get all training sessions
 */
export async function getAllSessions(): Promise<TrainingSession[]> {
  const db = await getDB();
  return db.getAll('sessions');
}

/**
 * Clear all training data
 */
export async function clearAllTrainingData(): Promise<void> {
  const db = await getDB();
  await Promise.all([
    db.clear('progress'),
    db.clear('sessions'),
  ]);
}

/**
 * Export all training data
 */
export async function exportTrainingData(): Promise<string> {
  const progress = await getAllProgress();
  const sessions = await getAllSessions();
  
  return JSON.stringify({
    progress,
    sessions,
    exportedAt: new Date().toISOString(),
    version: 1,
  }, null, 2);
}

/**
 * Import training data
 */
export async function importTrainingData(jsonString: string): Promise<void> {
  const data = JSON.parse(jsonString);
  const db = await getDB();
  
  // Import progress
  if (data.progress && Array.isArray(data.progress)) {
    const tx = db.transaction('progress', 'readwrite');
    for (const progress of data.progress) {
      await tx.store.put(progress);
    }
    await tx.done;
  }
  
  // Import sessions
  if (data.sessions && Array.isArray(data.sessions)) {
    const tx = db.transaction('sessions', 'readwrite');
    for (const session of data.sessions) {
      await tx.store.put(session);
    }
    await tx.done;
  }
}
