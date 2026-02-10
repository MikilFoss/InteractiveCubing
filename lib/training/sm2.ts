// SM-2 Spaced Repetition Algorithm Implementation

export interface AlgorithmProgress {
  caseId: number;
  // SM-2 fields
  easeFactor: number;      // starts at 2.5
  interval: number;        // days until next review
  repetitions: number;     // successful reps in a row
  nextReviewDate: string;  // ISO date
  // Stats
  totalAttempts: number;
  fullConfidence: number;
  lightConfidence: number;
  failed: number;
  lastAttempt: string;     // ISO timestamp
}

export interface TrainingSession {
  date: string;
  algorithmsReviewed: number;
  masteredCount: number;   // algorithms with interval > 21 days
}

export type ConfidenceLevel = 'full' | 'light' | 'failed';

// Minimum ease factor to prevent cards from becoming too hard
const MIN_EASE_FACTOR = 1.3;
// Days threshold for considering an algorithm "mastered"
export const MASTERY_THRESHOLD_DAYS = 21;

/**
 * Create initial progress for a new algorithm
 */
export function createInitialProgress(caseId: number): AlgorithmProgress {
  const today = new Date().toISOString().split('T')[0];
  return {
    caseId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: today,
    totalAttempts: 0,
    fullConfidence: 0,
    lightConfidence: 0,
    failed: 0,
    lastAttempt: '',
  };
}

/**
 * Update algorithm progress based on confidence level
 * 
 * SM-2 algorithm with modifications:
 * - Full confidence (5): Standard SM-2 success path
 * - Light confidence (3): Smaller interval increase, no EF change
 * - Failed (0): Reset to learning phase
 */
export function updateProgress(
  progress: AlgorithmProgress,
  confidence: ConfidenceLevel
): AlgorithmProgress {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  const updated: AlgorithmProgress = {
    ...progress,
    totalAttempts: progress.totalAttempts + 1,
    lastAttempt: now.toISOString(),
  };

  switch (confidence) {
    case 'full':
      // Grade 5 - perfect response
      updated.fullConfidence++;
      
      if (progress.repetitions === 0) {
        updated.interval = 1;
      } else if (progress.repetitions === 1) {
        updated.interval = 6;
      } else {
        updated.interval = Math.round(progress.interval * progress.easeFactor);
      }
      
      // Increase ease factor for consistent success
      updated.easeFactor = progress.easeFactor + 0.1;
      updated.repetitions = progress.repetitions + 1;
      break;

    case 'light':
      // Grade 3 - correct with difficulty
      updated.lightConfidence++;
      
      if (progress.repetitions === 0) {
        updated.interval = 1;
      } else {
        // Smaller interval increase for hesitant responses
        updated.interval = Math.round(progress.interval * 1.2);
      }
      
      // Keep ease factor unchanged
      updated.repetitions = progress.repetitions + 1;
      break;

    case 'failed':
      // Grade 0 - complete blackout
      updated.failed++;
      
      // Reset to learning phase
      updated.interval = 0;
      updated.repetitions = 0;
      
      // Decrease ease factor (but not below minimum)
      updated.easeFactor = Math.max(MIN_EASE_FACTOR, progress.easeFactor - 0.2);
      break;
  }

  // Cap maximum interval at 365 days
  updated.interval = Math.min(updated.interval, 365);
  
  // Calculate next review date
  const nextDate = new Date(today);
  nextDate.setDate(nextDate.getDate() + updated.interval);
  updated.nextReviewDate = nextDate.toISOString().split('T')[0];

  return updated;
}

/**
 * Check if an algorithm is due for review
 */
export function isDueForReview(progress: AlgorithmProgress): boolean {
  const today = new Date().toISOString().split('T')[0];
  return progress.nextReviewDate <= today;
}

/**
 * Check if an algorithm is considered "mastered"
 */
export function isMastered(progress: AlgorithmProgress): boolean {
  return progress.interval >= MASTERY_THRESHOLD_DAYS;
}

/**
 * Get priority score for an algorithm (lower = higher priority)
 * Used for selecting which card to show next
 */
export function getPriorityScore(progress: AlgorithmProgress): number {
  const today = new Date().toISOString().split('T')[0];
  const todayDate = new Date(today);
  const reviewDate = new Date(progress.nextReviewDate);
  
  // Days overdue (negative if not due yet)
  const daysOverdue = Math.floor(
    (todayDate.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Base priority on how overdue + difficulty
  // Lower ease factor = harder = higher priority
  return -daysOverdue - (3 - progress.easeFactor);
}

/**
 * Select the next algorithm to review from a list
 */
export function selectNextAlgorithm(
  progressList: AlgorithmProgress[]
): AlgorithmProgress | null {
  // First, filter to algorithms that are due
  const dueAlgorithms = progressList.filter(isDueForReview);
  
  if (dueAlgorithms.length === 0) {
    // If none are due, return null or the one coming up soonest
    if (progressList.length === 0) return null;
    
    // Sort by next review date
    const sorted = [...progressList].sort((a, b) => 
      a.nextReviewDate.localeCompare(b.nextReviewDate)
    );
    return sorted[0];
  }
  
  // Sort by priority (most urgent first)
  const sorted = [...dueAlgorithms].sort((a, b) => 
    getPriorityScore(b) - getPriorityScore(a)
  );
  
  return sorted[0];
}

/**
 * Calculate statistics from progress data
 */
export function calculateTrainingStats(progressList: AlgorithmProgress[]) {
  const total = progressList.length;
  const mastered = progressList.filter(isMastered).length;
  const dueCount = progressList.filter(isDueForReview).length;
  const learning = progressList.filter(p => p.repetitions > 0 && !isMastered(p)).length;
  const newCards = progressList.filter(p => p.repetitions === 0).length;
  
  const totalAttempts = progressList.reduce((sum, p) => sum + p.totalAttempts, 0);
  const totalFull = progressList.reduce((sum, p) => sum + p.fullConfidence, 0);
  const totalLight = progressList.reduce((sum, p) => sum + p.lightConfidence, 0);
  const totalFailed = progressList.reduce((sum, p) => sum + p.failed, 0);
  
  const successRate = totalAttempts > 0 
    ? ((totalFull + totalLight) / totalAttempts) * 100 
    : 0;

  return {
    total,
    mastered,
    masteredPercent: total > 0 ? (mastered / total) * 100 : 0,
    dueCount,
    learning,
    newCards,
    totalAttempts,
    successRate,
    fullConfidenceTotal: totalFull,
    lightConfidenceTotal: totalLight,
    failedTotal: totalFailed,
  };
}
