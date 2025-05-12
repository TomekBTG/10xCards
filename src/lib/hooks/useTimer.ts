import { useState, useRef, useCallback, useEffect } from "react";

interface TimerReturnType {
  seconds: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
  isRunning: boolean;
}

/**
 * Hook do obsługi timera z wykorzystaniem głównie referencji
 */
export function useTimer(): TimerReturnType {
  // Używamy referencji zamiast stanu dla wewnętrznych zmiennych
  const secondsRef = useRef<number>(0);
  const [seconds, setSeconds] = useState<number>(0); // Tylko do wyzwalania renderu
  const isRunningRef = useRef<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false); // Tylko do wyzwalania renderu
  const intervalIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Funkcja aktualizująca czas - wywołuje się z interwału
  const updateTimer = useCallback(() => {
    if (!isRunningRef.current || !startTimeRef.current) return;

    const currentTime = Date.now();
    const elapsedSeconds = Math.floor((currentTime - startTimeRef.current) / 1000);

    // Aktualizuj licznik sekund tylko jeśli się zmienił
    if (elapsedSeconds !== secondsRef.current) {
      secondsRef.current = elapsedSeconds;
      setSeconds(elapsedSeconds);
    }
  }, []);

  // Zatrzymanie interwału
  const clearTimerInterval = useCallback(() => {
    if (intervalIdRef.current !== null) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  // Funkcja start timera
  const start = useCallback(() => {
    // Jeśli timer już działa, nie rób nic
    if (isRunningRef.current) {
      return;
    }

    // Ustaw czas startowy, uwzględniając dotychczasowy czas
    if (startTimeRef.current === null || secondsRef.current === 0) {
      startTimeRef.current = Date.now();
    } else {
      // Jeśli timer był zatrzymany, dostosuj czas startowy
      startTimeRef.current = Date.now() - secondsRef.current * 1000;
    }

    // Czyszczenie istniejącego interwału (na wszelki wypadek)
    clearTimerInterval();

    // Utwórz nowy interwał
    intervalIdRef.current = window.setInterval(updateTimer, 100);

    // Wykonaj natychmiastową aktualizację
    isRunningRef.current = true;
    setIsRunning(true);
    updateTimer();
  }, [clearTimerInterval, updateTimer]);

  // Funkcja stop timera
  const stop = useCallback(() => {
    if (!isRunningRef.current) return;

    // Zatrzymaj timer
    isRunningRef.current = false;
    setIsRunning(false);

    // Czyszczenie interwału
    clearTimerInterval();
  }, [clearTimerInterval]);

  // Funkcja reset timera
  const reset = useCallback(() => {
    // Zatrzymaj timer najpierw
    stop();

    // Resetuj liczniki
    secondsRef.current = 0;
    setSeconds(0);
    startTimeRef.current = null;
  }, [stop]);

  // Czyszczenie podczas odmontowania komponentu
  useEffect(() => {
    return () => {
      clearTimerInterval();
    };
  }, [clearTimerInterval]);

  return {
    seconds,
    start,
    stop,
    reset,
    isRunning,
  };
}
