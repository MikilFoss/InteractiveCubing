'use client';

import { ConfidenceLevel } from '@/lib/training/sm2';
import styles from './Training.module.css';

interface ConfidenceButtonsProps {
  onRate: (confidence: ConfidenceLevel) => void;
  disabled?: boolean;
}

export default function ConfidenceButtons({
  onRate,
  disabled = false,
}: ConfidenceButtonsProps) {
  return (
    <div className={styles.confidenceButtons}>
      <p className={styles.ratePrompt}>How did you do?</p>
      <div className={styles.buttonGroup}>
        <button
          className={`${styles.confidenceButton} ${styles.failedButton}`}
          onClick={() => onRate('failed')}
          disabled={disabled}
        >
          <span className={styles.buttonEmoji}>❌</span>
          <span className={styles.buttonLabel}>Failed</span>
          <span className={styles.buttonHint}>Couldn't do it</span>
        </button>
        
        <button
          className={`${styles.confidenceButton} ${styles.lightButton}`}
          onClick={() => onRate('light')}
          disabled={disabled}
        >
          <span className={styles.buttonEmoji}>🤔</span>
          <span className={styles.buttonLabel}>Light</span>
          <span className={styles.buttonHint}>Got it but hesitated</span>
        </button>
        
        <button
          className={`${styles.confidenceButton} ${styles.fullButton}`}
          onClick={() => onRate('full')}
          disabled={disabled}
        >
          <span className={styles.buttonEmoji}>✅</span>
          <span className={styles.buttonLabel}>Full</span>
          <span className={styles.buttonHint}>Knew it perfectly</span>
        </button>
      </div>
    </div>
  );
}
