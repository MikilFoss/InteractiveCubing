'use client';

import { SolveResult, PenaltyType } from '@/types/timer';
import { formatSolveTime, formatDateTime } from '@/lib/timer/timeFormatter';
import styles from './Timer.module.css';

interface TimesListProps {
  solves: SolveResult[];
  onDelete: (id: string) => void;
  onUpdatePenalty: (id: string, penalty: PenaltyType) => void;
}

export default function TimesList({
  solves,
  onDelete,
  onUpdatePenalty,
}: TimesListProps) {
  // Show most recent first
  const reversedSolves = [...solves].reverse();

  return (
    <div className={styles.timesList}>
      <div className={styles.timesHeader}>
        <span className={styles.timesTitle}>Recent Times</span>
        <span className={styles.timesCount}>{solves.length} total</span>
      </div>

      <div className={styles.timesScroll}>
        {reversedSolves.length === 0 ? (
          <div className={styles.emptyState}>
            No times recorded yet. Start solving!
          </div>
        ) : (
          reversedSolves.map((solve, index) => (
            <div key={solve.id} className={styles.timeEntry}>
              <span className={styles.timeNumber}>
                {solves.length - index}.
              </span>

              <span
                className={`${styles.timeValue} ${
                  solve.penalty === -1
                    ? styles.timeValueDNF
                    : solve.penalty === 2000
                    ? styles.timeValuePlus2
                    : ''
                }`}
              >
                {formatSolveTime(solve.time, solve.penalty)}
              </span>

              <span className={styles.timeDate}>
                {formatDateTime(solve.timestamp)}
              </span>

              <div className={styles.timeActions}>
                <button
                  className={`${styles.timeActionButton} ${
                    solve.penalty === 2000 ? styles.timeActionButtonActive : ''
                  }`}
                  onClick={() =>
                    onUpdatePenalty(
                      solve.id,
                      solve.penalty === 2000 ? 0 : 2000
                    )
                  }
                  title="Add/remove +2 penalty"
                >
                  +2
                </button>

                <button
                  className={`${styles.timeActionButton} ${
                    solve.penalty === -1 ? styles.timeActionButtonActive : ''
                  }`}
                  onClick={() =>
                    onUpdatePenalty(
                      solve.id,
                      solve.penalty === -1 ? 0 : -1
                    )
                  }
                  title="Mark as DNF"
                >
                  DNF
                </button>

                <button
                  className={`${styles.timeActionButton} ${styles.deleteButton}`}
                  onClick={() => onDelete(solve.id)}
                  title="Delete time"
                >
                  &times;
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
