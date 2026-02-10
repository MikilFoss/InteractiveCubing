'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTimer } from '@/hooks/useTimer';
import { useTimerStorage } from '@/hooks/useTimerStorage';
import { SolveResult, DateRange, PenaltyType, TimerSettings } from '@/types/timer';
import { calculateSessionStats } from '@/lib/timer/statistics';
import { exportAllData } from '@/lib/storage/timerStorage';
import { exportToCsTimerFormat } from '@/lib/storage/importExport';
import TimerDisplay from './TimerDisplay';
import ScrambleDisplay from './ScrambleDisplay';
import StatsPanel from './StatsPanel';
import TimesList from './TimesList';
import ProgressChart from './ProgressChart';
import ImportModal from './ImportModal';
import OptionsModal from './OptionsModal';
import ScrambleVisualization from './ScrambleVisualization';
import styles from './Timer.module.css';

export default function Timer() {
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);

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
    settings,
    updateSettings,
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

  // Handle export - all data as JSON
  const handleExportAll = useCallback(async () => {
    const data = await exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interactivecubing-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // Handle export - csTimer format
  const handleExportCsTimer = useCallback(() => {
    const data = exportToCsTimerFormat(solves);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cstimer-export-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [solves]);

  if (loading) {
    return (
      <div className={styles.timerContainer}>
        <div className={styles.instructions}>Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Scramble with options button */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <ScrambleDisplay scramble={scramble} onNewScramble={generateNewScramble} />
        </div>
        <button
          className={styles.optionsButton}
          onClick={() => setOptionsModalOpen(true)}
          title="Timer Options"
        >
          Options
        </button>
      </div>

      {/* Timer with visualization */}
      <div className={styles.timerSection}>
        <TimerDisplay
          time={currentTime}
          state={state}
          onTouchStart={handleInputDown}
          onTouchEnd={handleInputUp}
        />
        {settings.showVisualization && (
          <div className={styles.cubeVisualization}>
            <ScrambleVisualization
              scramble={scramble}
              mode={settings.visualizationMode}
            />
          </div>
        )}
      </div>

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

          {/* Import/Export buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              className={`${styles.button} ${styles.buttonSecondary}`}
              style={{ width: '100%' }}
              onClick={() => setImportModalOpen(true)}
            >
              Import csTimer Data
            </button>
            <button
              className={`${styles.button} ${styles.buttonSecondary}`}
              style={{ width: '100%' }}
              onClick={handleExportAll}
              disabled={solves.length === 0}
            >
              Export All Data (JSON)
            </button>
            <button
              className={`${styles.button} ${styles.buttonSecondary}`}
              style={{ width: '100%' }}
              onClick={handleExportCsTimer}
              disabled={solves.length === 0}
            >
              Export for csTimer
            </button>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImport}
      />

      {/* Options Modal */}
      <OptionsModal
        isOpen={optionsModalOpen}
        onClose={() => setOptionsModalOpen(false)}
        settings={settings}
        onSave={updateSettings}
      />
    </div>
  );
}
