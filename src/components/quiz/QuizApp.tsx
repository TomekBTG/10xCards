import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useQuizManager } from "../../lib/hooks/useQuizManager";
import QuizCard from "./QuizCard";
import QuizNavigation from "./QuizNavigation";
import QuizTimer from "./QuizTimer";
import QuizSummary from "./QuizSummary";
import QuizSetup from "./QuizSetup";
import type { QuizSessionOptions } from "../../types";

// Ustawienia początkowe parametrów
const defaultSessionOptions: QuizSessionOptions = {
  categoryId: null,
  difficulty: null,
  limit: 10,
};

export default function QuizApp() {
  const [sessionOptions, setSessionOptions] = useState<QuizSessionOptions>(defaultSessionOptions);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [isSavingResults, setIsSavingResults] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [resultsSaved, setResultsSaved] = useState<boolean>(false);
  const saveAttemptedRef = useRef<boolean>(false);

  const {
    state,
    currentCard,
    revealAnswer,
    markAnswer,
    nextCard,
    restartQuiz,
    seconds,
    loadFlashcards,
    categories,
    startTimer,
    saveQuizResults,
  } = useQuizManager();

  // Obsługa zmiany parametrów sesji
  const handleSessionChange = useCallback((newOptions: QuizSessionOptions) => {
    setSessionOptions(newOptions);
  }, []);

  // Rozpoczęcie quizu
  const startQuiz = useCallback(async () => {
    try {
      // Najpierw ładujemy karty
      await loadFlashcards(sessionOptions);

      // Ustawiamy flagę, że quiz został rozpoczęty
      setQuizStarted(true);

      // Uruchamiamy timer po ustawieniu flagi
      startTimer();
    } catch (error) {
      console.error("Error starting quiz:", error);
    }
  }, [sessionOptions, loadFlashcards, startTimer]);

  // Resetowanie quizu i powrót do ekranu konfiguracji
  const handleRestart = useCallback(() => {
    restartQuiz();
    setQuizStarted(false);
    setResultsSaved(false);
    setSaveError(null);
    saveAttemptedRef.current = false;
  }, [restartQuiz]);

  // Automatyczne przejście do następnej karty po oznaczeniu
  const handleMarkAndNext = useCallback(
    (correct: boolean) => {
      markAnswer(correct);
      // Automatyczne przejście do następnej karty po krótkim opóźnieniu
      setTimeout(() => nextCard(), 500);
    },
    [markAnswer, nextCard]
  );

  // Memoizowane kategorie dla komponentu konfiguracji
  const memoizedCategories = useMemo(() => categories, [categories]);

  // Zapisz wyniki po zakończeniu quizu - tylko raz
  useEffect(() => {
    const saveResults = async () => {
      if (state.isFinished && quizStarted && !isSavingResults && !resultsSaved && !saveAttemptedRef.current) {
        try {
          saveAttemptedRef.current = true; // Oznaczamy, że próbowaliśmy zapisać
          setIsSavingResults(true);
          setSaveError(null);

          // Zapisujemy wyniki z aktualnymi statystykami
          await saveQuizResults();
          setResultsSaved(true); // Oznaczamy, że wyniki zostały zapisane

          console.log("Wyniki quizu zostały zapisane pomyślnie");
        } catch (error) {
          console.error("Błąd podczas zapisywania wyników:", error);
          setSaveError(error instanceof Error ? error.message : "Nieznany błąd podczas zapisywania wyników");
        } finally {
          setIsSavingResults(false);
        }
      }
    };

    saveResults();
  }, [state.isFinished, quizStarted, saveQuizResults]);

  // Stan błędu
  if (state.error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="p-4 border border-red-400 dark:border-red-800 rounded-md bg-red-100 dark:bg-red-900/30 text-center">
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">Wystąpił błąd</h2>
          <p className="mb-4 text-red-600 dark:text-red-400">{state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  // Brak fiszek po rozpoczęciu quizu
  if (quizStarted && state.cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="p-6 border border-gray-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 text-center max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Brak fiszek do powtórki</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            {sessionOptions.categoryId || sessionOptions.difficulty
              ? "Nie znaleziono fiszek spełniających wybrane parametry."
              : "Utwórz fiszki, aby rozpocząć sesję powtórkową."}
          </p>
          <button
            onClick={() => setQuizStarted(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Wróć do konfiguracji
          </button>
        </div>
      </div>
    );
  }

  // Quiz zakończony - wyświetl podsumowanie
  if (state.isFinished && quizStarted) {
    return (
      <QuizSummary
        stats={state.stats}
        onRestart={handleRestart}
        isSavingResults={isSavingResults}
        saveError={saveError}
      />
    );
  }

  // Etap 1: Konfiguracja quizu
  if (!quizStarted) {
    return (
      <QuizSetup
        categories={memoizedCategories}
        filterOptions={sessionOptions}
        onFilterChange={handleSessionChange}
        onStart={startQuiz}
        isLoading={state.isLoading}
      />
    );
  }

  // Etap 2: Renderowanie aktywnego quizu
  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-6 px-4 py-3 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Karta {state.currentIndex + 1} z {state.cards.length}
        </div>
        <QuizTimer seconds={seconds} />
      </div>

      {currentCard && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
          <QuizCard card={currentCard} />
          <div className="border-t border-gray-200 dark:border-zinc-800 p-4">
            <QuizNavigation revealed={currentCard.revealed} onReveal={revealAnswer} onMark={handleMarkAndNext} />
          </div>
        </div>
      )}
    </div>
  );
}
