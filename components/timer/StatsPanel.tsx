'use client';

import { SessionStats } from '@/types/timer';
import { formatTime } from '@/lib/timer/timeFormatter';
import styles from './Timer.module.css';

interface StatsPanelProps {
  stats: SessionStats;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  const formatAvg = (value: number | null | undefined, isDNF?: boolean): string => {
    if (value === null || value === undefined) return '-';
    if (isDNF || value === -1) return 'DNF';
    return formatTime(value);
  };

  const formatBest = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    if (value === Infinity) return 'DNF';
    return formatTime(value);
  };

  return (
    <div className={styles.statsPanel}>
      <div className={styles.statsTitle}>
        <span>Statistics</span>
        <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 400 }}>
          {stats.count} solves
        </span>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Best</span>
          <span className={`${styles.statValue} ${styles.statValueBest}`}>
            {formatBest(stats.best?.effective)}
          </span>
        </div>

        <div className={styles.statItem}>
          <span className={styles.statLabel}>Mean</span>
          <span className={styles.statValue}>
            {formatAvg(stats.mean)}
          </span>
        </div>

        <div className={styles.statItem}>
          <span className={styles.statLabel}>Ao5</span>
          <span className={styles.statValue}>
            {formatAvg(stats.ao5?.value, stats.ao5?.isDNF)}
          </span>
        </div>

        <div className={styles.statItem}>
          <span className={styles.statLabel}>Ao12</span>
          <span className={styles.statValue}>
            {formatAvg(stats.ao12?.value, stats.ao12?.isDNF)}
          </span>
        </div>

        <div className={styles.statItem}>
          <span className={styles.statLabel}>Ao50</span>
          <span className={styles.statValue}>
            {formatAvg(stats.ao50?.value, stats.ao50?.isDNF)}
          </span>
        </div>

        <div className={styles.statItem}>
          <span className={styles.statLabel}>Ao100</span>
          <span className={styles.statValue}>
            {formatAvg(stats.ao100?.value, stats.ao100?.isDNF)}
          </span>
        </div>
      </div>
    </div>
  );
}
