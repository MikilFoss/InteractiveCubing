'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTraining } from '@/hooks/useTraining';
import TrainingStats from '@/components/training/TrainingStats';
import ConfidenceButtons from '@/components/training/ConfidenceButtons';
import styles from '@/components/training/Training.module.css';

// Dynamic import for TrainingCard to avoid SSR issues with TwistyPlayer
const TrainingCard = dynamic(
  () => import('@/components/training/TrainingCard'),
  {
    ssr: false,
    loading: () => (
      <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
        Loading...
      </div>
    ),
  }
);

export default function TrainingPage() {
  const [showSolution, setShowSolution] = useState(false);
  
  const {
    loading,
    error,
    currentCase,
    currentProgress,
    stats,
    sessions,
    sessionReviewCount,
    handleRate,
    getNextReviewDate,
  } = useTraining();

  // Reset solution visibility when moving to next card
  const handleRateWithReset = (confidence: 'full' | 'light' | 'failed') => {
    setShowSolution(false);
    handleRate(confidence);
  };

  if (loading) {
    return (
      <main className="page">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
            Loading training data...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container">
        {/* Header */}
        <div className={styles.trainingHeader}>
          <Link href="/" style={{ color: '#6b7280', fontSize: '14px' }}>
            &larr; Back to Home
          </Link>
          <h1 className="title" style={{ marginTop: '16px' }}>
            F2L Training
          </h1>
          <p className="subtitle">
            Practice algorithms with spaced repetition
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              color: '#991b1b',
              fontSize: '14px',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Main content layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* Training card section */}
          <div>
            {currentCase && currentProgress ? (
              <>
                <TrainingCard
                  algCase={currentCase}
                  progress={currentProgress}
                  showSolution={showSolution}
                  onToggleSolution={() => setShowSolution(!showSolution)}
                />
                <ConfidenceButtons onRate={handleRateWithReset} />
              </>
            ) : stats.dueCount === 0 ? (
              <div className={styles.noCardsMessage}>
                <h3>🎉 All caught up!</h3>
                <p>No algorithms due for review right now.</p>
                {getNextReviewDate() && (
                  <p className={styles.nextReview}>
                    Next review: {getNextReviewDate()}
                  </p>
                )}
                {sessionReviewCount > 0 && (
                  <p style={{ marginTop: '12px', fontSize: '14px' }}>
                    You reviewed {sessionReviewCount} algorithm
                    {sessionReviewCount !== 1 ? 's' : ''} this session.
                  </p>
                )}
              </div>
            ) : (
              <div className={styles.noCardsMessage}>
                <h3>Loading...</h3>
                <p>Preparing your training session.</p>
              </div>
            )}
          </div>

          {/* Stats section */}
          <TrainingStats stats={stats} sessions={sessions} />
        </div>
      </div>
    </main>
  );
}
