'use client';

import { useState } from 'react';
import styles from './Timer.module.css';

interface ScrambleDisplayProps {
  scramble: string;
  onNewScramble: () => void;
}

export default function ScrambleDisplay({
  scramble,
  onNewScramble,
}: ScrambleDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scramble);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={styles.scrambleContainer}>
      <div className={styles.scrambleLabel}>Scramble</div>
      <div className={styles.scrambleText}>{scramble}</div>
      <div className={styles.scrambleActions}>
        <button className={styles.scrambleButton} onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button className={styles.scrambleButton} onClick={onNewScramble}>
          New Scramble
        </button>
      </div>
    </div>
  );
}
