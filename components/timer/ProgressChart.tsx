'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { SolveResult, DateRange, DailyAverage } from '@/types/timer';
import { calculateChartData } from '@/lib/timer/statistics';
import { msToSeconds, formatDate } from '@/lib/timer/timeFormatter';
import styles from './Timer.module.css';

interface ProgressChartProps {
  solves: SolveResult[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export default function ProgressChart({
  solves,
  dateRange,
  onDateRangeChange,
}: ProgressChartProps) {
  const chartData = useMemo(() => {
    const { dailyAverages, ao5Points, times } = calculateChartData(solves, dateRange);

    // Create chart data combining daily averages with running ao12 trend
    // We'll show daily averages as main data points
    const dataMap = new Map<string, {
      date: string;
      displayDate: string;
      dailyMean?: number;
      runningAo12?: number;
      best?: number;
      count: number;
    }>();

    // Add daily averages
    for (const daily of dailyAverages) {
      dataMap.set(daily.date, {
        date: daily.date,
        displayDate: formatDate(daily.date),
        dailyMean: msToSeconds(daily.mean),
        runningAo12: daily.runningAo12 ? msToSeconds(daily.runningAo12) : undefined,
        best: msToSeconds(daily.best),
        count: daily.count,
      });
    }

    // Sort by date
    return Array.from(dataMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [solves, dateRange]);

  const formatTooltipValue = (value: number) => {
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    if (minutes > 0) {
      return `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
    }
    return `${seconds.toFixed(2)}s`;
  };

  const formatYAxis = (value: number) => {
    if (value >= 60) {
      return `${Math.floor(value / 60)}:${(value % 60).toFixed(0).padStart(2, '0')}`;
    }
    return `${value.toFixed(0)}s`;
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <span className={styles.chartTitle}>Progress</span>
        <div className={styles.chartFilters}>
          <button
            className={`${styles.chartFilterButton} ${
              dateRange === '7d' ? styles.chartFilterActive : ''
            }`}
            onClick={() => onDateRangeChange('7d')}
          >
            7D
          </button>
          <button
            className={`${styles.chartFilterButton} ${
              dateRange === '30d' ? styles.chartFilterActive : ''
            }`}
            onClick={() => onDateRangeChange('30d')}
          >
            30D
          </button>
          <button
            className={`${styles.chartFilterButton} ${
              dateRange === 'all' ? styles.chartFilterActive : ''
            }`}
            onClick={() => onDateRangeChange('all')}
          >
            All
          </button>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        {chartData.length === 0 ? (
          <div className={styles.chartEmpty}>
            Not enough data to display chart
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                width={45}
              />
              <Tooltip
                formatter={(value, name) => {
                  const numValue = typeof value === 'number' ? value : 0;
                  const strName = String(name);
                  return [
                    formatTooltipValue(numValue),
                    strName === 'dailyMean' ? 'Daily Avg' :
                    strName === 'runningAo12' ? 'Running Ao12' :
                    strName === 'best' ? 'Best' : strName,
                  ];
                }}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value) =>
                  value === 'dailyMean' ? 'Daily Avg' :
                  value === 'runningAo12' ? 'Running Ao12' :
                  value === 'best' ? 'Best' : value
                }
              />

              <Line
                type="monotone"
                dataKey="dailyMean"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: '#2563eb', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                connectNulls
              />

              <Line
                type="monotone"
                dataKey="runningAo12"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                connectNulls
              />

              <Line
                type="monotone"
                dataKey="best"
                stroke="#f59e0b"
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
