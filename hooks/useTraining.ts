'use client';

import { useState, useEffect, useCallback } from 'react';
import { f2lAlgSet } from '@/data/f2l';
import { AlgCase } from '@/types/alg';
import {
  AlgorithmProgress,
  TrainingSession,
  ConfidenceLevel,
  updateProgress,
  selectNextAlgorithm,
  calculateTrainingStats,
  isMastered,
} from '@/lib/training/sm2';
import {
  getAllProgress,
  saveProgress,
  initializeAllProgress,
  recordSession,
  getRecentSessions,
} from '@/lib/storage/trainingStorage';

export function useTraining() {
  const [progressMap, setProgressMap] = useState<Map<number, AlgorithmProgress>>(new Map());
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [currentCase, setCurrentCase] = useState<AlgCase | null>(null);
  const [currentProgress, setCurrentProgress] = useState<AlgorithmProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionReviewCount, setSessionReviewCount] = useState(0);

  // Get all case IDs
  const caseIds = f2lAlgSet.cases.map(c => c.id);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Initialize progress for all cases
      await initializeAllProgress(caseIds);
      
      // Load all progress
      const allProgress = await getAllProgress();
      const map = new Map(allProgress.map(p => [p.caseId, p]));
      setProgressMap(map);
      
      // Load recent sessions for chart
      const recentSessions = await getRecentSessions(30);
      setSessions(recentSessions);
      
      // Select first card
      const next = selectNextAlgorithm(allProgress);
      if (next) {
        const algCase = f2lAlgSet.cases.find(c => c.id === next.caseId);
        setCurrentCase(algCase || null);
        setCurrentProgress(next);
      }
    } catch (err) {
      console.error('Failed to load training data:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.includes('IndexedDB')) {
        setError('Storage is not available. Training progress won\'t be saved.');
      } else {
        setError(`Failed to load training data: ${message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [caseIds]);

  // Handle confidence rating
  const handleRate = useCallback(async (confidence: ConfidenceLevel) => {
    if (!currentProgress || !currentCase) return;

    try {
      // Update progress
      const updated = updateProgress(currentProgress, confidence);
      await saveProgress(updated);

      // Update local state
      setProgressMap(prev => {
        const next = new Map(prev);
        next.set(updated.caseId, updated);
        return next;
      });

      // Record session
      const today = new Date().toISOString().split('T')[0];
      const allProgress = Array.from(progressMap.values());
      allProgress[progressMap.get(updated.caseId) ? 
        allProgress.findIndex(p => p.caseId === updated.caseId) : 
        allProgress.length
      ] = updated;
      
      const masteredCount = allProgress.filter(isMastered).length;
      
      await recordSession({
        date: today,
        algorithmsReviewed: 1,
        masteredCount,
      });

      setSessionReviewCount(prev => prev + 1);

      // Reload sessions
      const recentSessions = await getRecentSessions(30);
      setSessions(recentSessions);

      // Select next card
      const updatedProgressList = Array.from(progressMap.values());
      updatedProgressList[
        updatedProgressList.findIndex(p => p.caseId === updated.caseId)
      ] = updated;
      
      const next = selectNextAlgorithm(updatedProgressList);
      if (next) {
        const algCase = f2lAlgSet.cases.find(c => c.id === next.caseId);
        setCurrentCase(algCase || null);
        setCurrentProgress(next);
      } else {
        setCurrentCase(null);
        setCurrentProgress(null);
      }
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  }, [currentProgress, currentCase, progressMap]);

  // Calculate stats
  const stats = calculateTrainingStats(Array.from(progressMap.values()));

  // Get next review date
  const getNextReviewDate = useCallback(() => {
    if (progressMap.size === 0) return null;
    
    const progressList = Array.from(progressMap.values());
    const sorted = [...progressList].sort((a, b) => 
      a.nextReviewDate.localeCompare(b.nextReviewDate)
    );
    
    return sorted[0]?.nextReviewDate || null;
  }, [progressMap]);

  return {
    loading,
    error,
    currentCase,
    currentProgress,
    stats,
    sessions,
    sessionReviewCount,
    handleRate,
    reload: loadData,
    getNextReviewDate,
  };
}
