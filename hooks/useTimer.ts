'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { TimerState, SolveResult, TimerSettings } from '@/types/timer';
import { generateScramble } from '@/lib/timer/scrambleGenerator';
import { generateId, getDateString } from '@/lib/timer/timeFormatter';
import { getSettings } from '@/lib/storage/timerStorage';

interface UseTimerOptions {
  onSolveComplete?: (solve: SolveResult) => void;
}

export function useTimer(options: UseTimerOptions = {}) {
  const { onSolveComplete } = options;

  const [state, setState] = useState<TimerState>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [scramble, setScramble] = useState('');
  const [lastResult, setLastResult] = useState<SolveResult | null>(null);
  const [settings] = useState<TimerSettings>(getSettings);

  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef(false);

  // Generate initial scramble
  useEffect(() => {
    setScramble(generateScramble());
  }, []);

  // Animation loop for running timer
  const updateTime = useCallback(() => {
    if (startTimeRef.current !== null) {
      const elapsed = performance.now() - startTimeRef.current;
      setCurrentTime(Math.floor(elapsed));
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }
  }, []);

  // Start the timer
  const startTimer = useCallback(() => {
    startTimeRef.current = performance.now();
    setState('running');
    animationFrameRef.current = requestAnimationFrame(updateTime);
  }, [updateTime]);

  // Stop the timer and save result
  const stopTimer = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (startTimeRef.current !== null) {
      const finalTime = Math.floor(performance.now() - startTimeRef.current);
      setCurrentTime(finalTime);

      const now = Date.now();
      const timestamp = Math.floor(now / 1000);

      const solve: SolveResult = {
        id: generateId(),
        time: finalTime,
        penalty: 0,
        scramble,
        timestamp,
        date: getDateString(timestamp),
      };

      setLastResult(solve);
      onSolveComplete?.(solve);

      // Generate new scramble for next solve
      setScramble(generateScramble());
    }

    startTimeRef.current = null;
    setState('stopped');
  }, [scramble, onSolveComplete]);

  // Reset to idle state
  const reset = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }

    startTimeRef.current = null;
    isHoldingRef.current = false;
    setCurrentTime(0);
    setState('idle');
    setLastResult(null);
  }, []);

  // Handle key/touch down
  const handleInputDown = useCallback(() => {
    if (state === 'running') {
      stopTimer();
      return;
    }

    if (state === 'idle' || state === 'stopped') {
      isHoldingRef.current = true;

      // Start hold timer - need to hold for settings.holdTime ms
      holdTimeoutRef.current = setTimeout(() => {
        if (isHoldingRef.current) {
          setState('ready');
        }
      }, settings.holdTime);
    }
  }, [state, settings.holdTime, stopTimer]);

  // Handle key/touch up
  const handleInputUp = useCallback(() => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }

    if (state === 'ready') {
      startTimer();
    } else if (state === 'stopped') {
      setState('idle');
    }

    isHoldingRef.current = false;
  }, [state, startTimer]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only respond to spacebar
      if (e.code !== 'Space') return;

      // Prevent default spacebar behavior (scrolling)
      e.preventDefault();

      // Ignore repeats (holding key)
      if (e.repeat) return;

      handleInputDown();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      e.preventDefault();
      handleInputUp();
    };

    // Escape to reset
    const handleEscape = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [handleInputDown, handleInputUp, reset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    currentTime,
    scramble,
    lastResult,
    settings,
    handleInputDown,
    handleInputUp,
    reset,
    generateNewScramble: () => setScramble(generateScramble()),
  };
}
