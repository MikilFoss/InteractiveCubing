'use client';

import { AlgCase } from '@/types/alg';
import { AlgorithmProgress, isMastered } from '@/lib/training/sm2';
import TwistyPlayer from '@/components/TwistyPlayer';
import styles from './Training.module.css';

interface TrainingCardProps {
  algCase: AlgCase;
  progress: AlgorithmProgress;
  showSolution: boolean;
  onToggleSolution: () => void;
}

export default function TrainingCard({
  algCase,
  progress,
  showSolution,
  onToggleSolution,
}: TrainingCardProps) {
  const mastered = isMastered(progress);
  
  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.caseName}>{algCase.name}</span>
          <span className={styles.caseCategory}>{algCase.category}</span>
        </div>
        {mastered && (
          <span className={styles.masteredBadge}>✓ Mastered</span>
        )}
      </div>

      {/* Setup moves */}
      <div className={styles.setupSection}>
        <div className={styles.sectionLabel}>Setup moves:</div>
        <div className={styles.setupMoves}>{algCase.setup || '(none)'}</div>
        <div className={styles.hint}>
          Execute these moves on a solved cube to create the case
        </div>
      </div>

      {/* 3D visualization */}
      <div className={styles.visualization}>
        <TwistyPlayer
          alg={algCase.setup || ''}
          visualization="3D"
          controlPanel="none"
          background="none"
          hintFacelets="floating"
        />
      </div>

      {/* Solution (toggleable) */}
      <div className={styles.solutionSection}>
        <button 
          className={styles.toggleButton}
          onClick={onToggleSolution}
        >
          {showSolution ? 'Hide Solution' : 'Show Solution'}
        </button>
        
        {showSolution && (
          <div className={styles.solutionContent}>
            <div className={styles.sectionLabel}>Solution:</div>
            <div className={styles.algorithm}>{algCase.algs[0]}</div>
            {algCase.algs.length > 1 && (
              <div className={styles.alternatives}>
                <span className={styles.altLabel}>Alternatives:</span>
                {algCase.algs.slice(1).map((alg, i) => (
                  <span key={i} className={styles.altAlg}>{alg}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress stats */}
      <div className={styles.progressSection}>
        <div className={styles.progressStats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{progress.totalAttempts}</span>
            <span className={styles.statLabel}>Attempts</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{progress.repetitions}</span>
            <span className={styles.statLabel}>Streak</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{progress.interval}d</span>
            <span className={styles.statLabel}>Interval</span>
          </div>
        </div>
      </div>
    </div>
  );
}
