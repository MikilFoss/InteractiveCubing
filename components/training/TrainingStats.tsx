'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from 'recharts';
import { TrainingSession } from '@/lib/training/sm2';
import styles from './Training.module.css';

interface TrainingStatsProps {
  stats: {
    total: number;
    mastered: number;
    masteredPercent: number;
    dueCount: number;
    learning: number;
    newCards: number;
    totalAttempts: number;
    successRate: number;
  };
  sessions: TrainingSession[];
}

export default function TrainingStats({ stats, sessions }: TrainingStatsProps) {
  // Prepare chart data from sessions
  const chartData = useMemo(() => {
    // Get last 30 days
    const days: string[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }

    // Map sessions to days
    const sessionMap = new Map(sessions.map(s => [s.date, s]));
    
    return days.map(date => {
      const session = sessionMap.get(date);
      return {
        date: date.slice(5), // MM-DD format
        fullDate: date,
        mastered: session?.masteredCount || 0,
        reviewed: session?.algorithmsReviewed || 0,
      };
    });
  }, [sessions]);

  // Calculate cumulative mastered over time
  const cumulativeData = useMemo(() => {
    let cumulative = 0;
    return chartData.map(d => {
      if (d.reviewed > 0) {
        cumulative = d.mastered;
      }
      return {
        ...d,
        masteredCumulative: cumulative || d.mastered,
      };
    });
  }, [chartData]);

  return (
    <div className={styles.statsContainer}>
      {/* Summary stats */}
      <div className={styles.summaryStats}>
        <div className={styles.mainStat}>
          <div className={styles.mainStatValue}>
            {stats.masteredPercent.toFixed(0)}%
          </div>
          <div className={styles.mainStatLabel}>Mastered</div>
          <div className={styles.mainStatSub}>
            {stats.mastered} of {stats.total} algorithms
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <span className={styles.statBoxValue}>{stats.dueCount}</span>
            <span className={styles.statBoxLabel}>Due Today</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statBoxValue}>{stats.learning}</span>
            <span className={styles.statBoxLabel}>Learning</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statBoxValue}>{stats.newCards}</span>
            <span className={styles.statBoxLabel}>New</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statBoxValue}>
              {stats.successRate.toFixed(0)}%
            </span>
            <span className={styles.statBoxLabel}>Success Rate</span>
          </div>
        </div>
      </div>

      {/* Progress chart */}
      <div className={styles.chartSection}>
        <h3 className={styles.chartTitle}>Progress (Last 30 Days)</h3>
        <div className={styles.chartWrapper}>
          {sessions.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={cumulativeData}>
                <defs>
                  <linearGradient id="masteredGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  domain={[0, stats.total]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number | undefined, name: string | undefined) => [
                    value ?? 0,
                    name === 'masteredCumulative' ? 'Mastered' : 'Reviewed',
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="masteredCumulative"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#masteredGradient)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.chartEmpty}>
              Start training to see your progress!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
