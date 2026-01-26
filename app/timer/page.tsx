'use client';

import Link from 'next/link';
import ClientTimer from '@/components/timer/ClientTimer';

export default function TimerPage() {
  return (
    <main className="page">
      <div className="container">
        <div className="header">
          <Link href="/" style={{ color: '#6b7280', fontSize: '14px' }}>
            &larr; Back to Home
          </Link>
          <h1 className="title" style={{ marginTop: '16px' }}>
            Timer
          </h1>
          <p className="subtitle">
            Track your solve times and monitor your progress
          </p>
        </div>

        <ClientTimer />
      </div>
    </main>
  );
}
