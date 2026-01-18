'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTimer } from '@/hooks/useTimer';
import { useTimerStorage } from '@/hooks/useTimerStorage';
import { SolveResult, DateRange, PenaltyType } from '@/types/timer';
import { calculateSessionStats } from '@/lib/timer/statistics';
import TimerDisplay from './TimerDisplay';
import ScrambleDisplay from './ScrambleDisplay';
import StatsPanel from './StatsPanel';
import TimesList from './TimesList';
import ProgressChart from './ProgressChart';
import ImportModal from './ImportModal';
import styles from './Timer.module.css';

export default function Timer() {
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [importModalOpen, setImportModalOpen] = useState(false);

  const {
    solves,
    loading,
    addSolve,
    updateSolve,
    deleteSolve,
    importSolves,
  } = useTimerStorage();

  const handleSolveComplete = useCallback(
    (solve: SolveResult) => {
      addSolve(solve);
    },
    [addSolve]
  );

  const {
    state,
    currentTime,
    scramble,
    handleInputDown,
    handleInputUp,
    generateNewScramble,
  } = useTimer({
    onSolveComplete: handleSolveComplete,
  });

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateSessionStats(solves);
  }, [solves]);

  // Handle penalty update
  const handleUpdatePenalty = useCallback(
    async (id: string, penalty: PenaltyType) => {
      const solve = solves.find((s) => s.id === id);
      if (solve) {
        await updateSolve({ ...solve, penalty });
      }
    },
    [solves, updateSolve]
  );

  // Handle import
  const handleImport = useCallback(
    async (newSolves: SolveResult[]) => {
      await importSolves(newSolves);
    },
    [importSolves]
  );

  if (loading) {
    return (
      <div className={styles.timerContainer}>
        <div className={styles.instructions}>Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Scramble */}
      <ScrambleDisplay scramble={scramble} onNewScramble={generateNewScramble} />

      {/* Timer */}
      <TimerDisplay
        time={currentTime}
        state={state}
        onTouchStart={handleInputDown}
        onTouchEnd={handleInputUp}
      />

      {/* Main content grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '32px',
        }}
      >
        {/* Left column - Stats and Times */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <StatsPanel stats={stats} />
          <TimesList
            solves={solves}
            onDelete={deleteSolve}
            onUpdatePenalty={handleUpdatePenalty}
          />
        </div>

        {/* Right column - Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <ProgressChart
            solves={solves}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />

          {/* Import button */}
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            style={{ width: '100%' }}
            onClick={() => setImportModalOpen(true)}
          >
            Import csTimer Data
          </button>
        </div>
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}
