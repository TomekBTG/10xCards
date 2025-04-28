import { useState, useEffect, useRef, useCallback } from "react";

interface TimerReturnType {
  seconds: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
  isRunning: boolean;
}

/**
 * Custom hook for tracking time duration
 * @returns TimerReturnType - Seconds passed, and methods to control the timer
 */
export function useTimer(): TimerReturnType {
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  // Callback to update timer based on actual elapsed time
  const tick = useCallback(() => {
    const now = Date.now();
    if (startTimeRef.current === null) {
      startTimeRef.current = now;
      lastTickRef.current = now;
      return;
    }

    // Calculate elapsed time since last tick
    if (lastTickRef.current) {
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      setSeconds(elapsed);
      lastTickRef.current = now;
    }
  }, []);

  // Start and manage the timer interval
  useEffect(() => {
    console.log("useEffect timer triggered, isRunning:", isRunning, "current interval:", !!intervalRef.current);

    if (isRunning) {
      // Initialize start time if not set
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now() - seconds * 1000; // Account for existing seconds
      }

      // Set up the interval to update every 100ms for smoother updates
      if (intervalRef.current === null) {
        console.log("Creating new timer interval");
        intervalRef.current = window.setInterval(tick, 100);
      }

      // Ensure immediate first tick
      tick();
    } else {
      // Clear interval when not running
      if (intervalRef.current) {
        console.log("Clearing timer interval");
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Clean up on unmount
    return () => {
      if (intervalRef.current) {
        console.log("Cleanup: clearing timer interval");
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, tick, seconds]);

  const start = useCallback(() => {
    console.log("start() called, current isRunning:", isRunning);

    if (!isRunning) {
      // If timer was stopped, adjust start time
      if (seconds > 0 && startTimeRef.current !== null) {
        startTimeRef.current = Date.now() - seconds * 1000;
      } else if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      }

      console.log("Setting isRunning to true");
      setIsRunning(true);
    }
  }, [isRunning, seconds]);

  const stop = useCallback(() => {
    console.log("stop() called, current isRunning:", isRunning);

    if (isRunning) {
      console.log("Setting isRunning to false");
      setIsRunning(false);
    }
  }, [isRunning]);

  const reset = useCallback(() => {
    stop();
    setSeconds(0);
    startTimeRef.current = null;
    lastTickRef.current = null;
  }, [stop]);

  return {
    seconds,
    start,
    stop,
    reset,
    isRunning,
  };
}
