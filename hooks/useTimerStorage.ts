'use client';

import { useState, useEffect, useCallback } from 'react';
import { SolveResult, DateRange } from '@/types/timer';
import {
  getAllSolves,
  addSolve as dbAddSolve,
  updateSolve as dbUpdateSolve,
  deleteSolve as dbDeleteSolve,
  importSolves as dbImportSolves,
  clearAllSolves,
} from '@/lib/storage/timerStorage';

export function useTimerStorage() {
  const [solves, setSolves] = useState<SolveResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all solves on mount
  useEffect(() => {
    loadSolves();
  }, []);

  const loadSolves = useCallback(async () => {
    try {
      setLoading(true);
      const allSolves = await getAllSolves();
      setSolves(allSolves);
      setError(null);
    } catch (err) {
      console.error('Failed to load solves:', err);
      setError('Failed to load times from storage');
    } finally {
      setLoading(false);
    }
  }, []);

  const addSolve = useCallback(async (solve: SolveResult) => {
    try {
      await dbAddSolve(solve);
      setSolves(prev => [...prev, solve]);
    } catch (err) {
      console.error('Failed to save solve:', err);
      setError('Failed to save time');
    }
  }, []);

  const updateSolve = useCallback(async (solve: SolveResult) => {
    try {
      await dbUpdateSolve(solve);
      setSolves(prev =>
        prev.map(s => s.id === solve.id ? solve : s)
      );
    } catch (err) {
      console.error('Failed to update solve:', err);
      setError('Failed to update time');
    }
  }, []);

  const deleteSolve = useCallback(async (id: string) => {
    try {
      await dbDeleteSolve(id);
      setSolves(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to delete solve:', err);
      setError('Failed to delete time');
    }
  }, []);

  const importSolves = useCallback(async (newSolves: SolveResult[]) => {
    try {
      setLoading(true);
      await dbImportSolves(newSolves);
      // Reload all solves to get proper order
      await loadSolves();
    } catch (err) {
      console.error('Failed to import solves:', err);
      setError('Failed to import times');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadSolves]);

  const clearAll = useCallback(async () => {
    try {
      await clearAllSolves();
      setSolves([]);
    } catch (err) {
      console.error('Failed to clear solves:', err);
      setError('Failed to clear times');
    }
  }, []);

  // Get filtered solves by date range
  const getSolvesByRange = useCallback((range: DateRange) => {
    if (range === 'all') return solves;

    const now = Date.now();
    const msInDay = 24 * 60 * 60 * 1000;
    const days = range === '7d' ? 7 : 30;
    const cutoff = now - days * msInDay;

    return solves.filter(s => s.timestamp * 1000 >= cutoff);
  }, [solves]);

  return {
    solves,
    loading,
    error,
    addSolve,
    updateSolve,
    deleteSolve,
    importSolves,
    clearAll,
    getSolvesByRange,
    reload: loadSolves,
  };
}
