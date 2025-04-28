import React, { useState, useCallback, useMemo } from "react";
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
      // Uruchamiamy timer z małym opóźnieniem, aby DOM zdążył się zaktualizować
      setTimeout(() => {
        startTimer();
        console.log("Timer started manually");
      }, 100);
    } catch (error) {
      console.error("Error starting quiz:", error);
    }
  }, [sessionOptions, loadFlashcards, startTimer]);

  // Resetowanie quizu i powrót do ekranu konfiguracji
  const handleRestart = useCallback(() => {
    restartQuiz();
    setQuizStarted(false);
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

  // Stan błędu
  if (state.error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="p-4 border border-destructive rounded-md bg-destructive/10 text-center">
          <h2 className="text-lg font-semibold text-destructive mb-2">Wystąpił błąd</h2>
          <p className="mb-4">{state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
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
        <div className="p-6 border rounded-md bg-muted text-center max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-2">Brak fiszek do powtórki</h2>
          <p className="mb-4">
            {sessionOptions.categoryId || sessionOptions.difficulty
              ? "Nie znaleziono fiszek spełniających wybrane parametry."
              : "Utwórz fiszki, aby rozpocząć sesję powtórkową."}
          </p>
          <button
            onClick={() => setQuizStarted(false)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 inline-block"
          >
            Wróć do konfiguracji
          </button>
        </div>
      </div>
    );
  }

  // Quiz zakończony - wyświetl podsumowanie
  if (state.isFinished && quizStarted) {
    return <QuizSummary stats={state.stats} onRestart={handleRestart} />;
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
    <div className="flex flex-col w-full max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          Karta {state.currentIndex + 1} z {state.cards.length}
        </div>
        <QuizTimer seconds={seconds} />
      </div>

      {currentCard && (
        <>
          <QuizCard card={currentCard} />
          <QuizNavigation revealed={currentCard.revealed} onReveal={revealAnswer} onMark={handleMarkAndNext} />
        </>
      )}
    </div>
  );
}
