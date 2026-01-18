'use client';

import { TimerState } from '@/types/timer';
import { formatTime } from '@/lib/timer/timeFormatter';
import styles from './Timer.module.css';

interface TimerDisplayProps {
  time: number;
  state: TimerState;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
}

export default function TimerDisplay({
  time,
  state,
  onTouchStart,
  onTouchEnd,
}: TimerDisplayProps) {
  const stateClass = {
    idle: styles.idle,
    holding: styles.holding,
    ready: styles.ready,
    running: styles.running,
    stopped: styles.stopped,
  }[state];

  const displayTime = formatTime(time);

  const instructions = {
    idle: 'Hold spacebar or tap to start',
    holding: 'Keep holding...',
    ready: 'Release to start timer',
    running: 'Press spacebar or tap to stop',
    stopped: 'Press spacebar to reset',
  }[state];

  return (
    <div className={styles.timerContainer}>
      <div
        className={`${styles.timerDisplay} ${stateClass}`}
        onTouchStart={(e) => {
          e.preventDefault();
          onTouchStart?.();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          onTouchEnd?.();
        }}
      >
        {displayTime}
      </div>
      <div className={styles.instructions}>{instructions}</div>
    </div>
  );
}
