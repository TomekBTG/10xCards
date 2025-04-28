import { useReducer, useEffect, useCallback, useState } from "react";
import type {
  FlashcardDTO,
  QuizAction,
  QuizFlashcardVM,
  QuizState,
  QuizStatsVM,
  FlashcardCategory,
  QuizSessionOptions,
} from "../../types";
import { useTimer } from "./useTimer";
import { createClient } from "@supabase/supabase-js";
import {
  getFlashcardsForQuiz,
  getFilteredFlashcards,
  getFlashcardCategories,
  shuffleArray,
} from "../services/quizService";
import type { PostgrestError } from "@supabase/supabase-js";

// Initialize the Supabase client
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initial quiz state
const initialState: QuizState = {
  cards: [],
  currentIndex: 0,
  isLoading: true,
  error: null,
  isFinished: false,
  stats: {
    total: 0,
    correctCount: 0,
    incorrectCount: 0,
    percentCorrect: 0,
    durationSeconds: 0,
  },
  sessionOptions: {
    categoryId: null,
    difficulty: null,
    limit: 10,
  },
  categories: [],
};

// Convert FlashcardDTO to QuizFlashcardVM
function mapFlashcardToQuizVM(flashcard: FlashcardDTO): QuizFlashcardVM {
  // Sprawdź, czy pola category_id, category_name i difficulty istnieją
  // Jeśli nie, użyj domyślnych wartości bazujących na is_ai_generated i status
  const categoryId = flashcard.category_id || (flashcard.is_ai_generated ? "ai_generated" : "user_created");

  const categoryName =
    flashcard.category_name || (flashcard.is_ai_generated ? "Wygenerowane przez AI" : "Utworzone przez użytkownika");

  const difficulty =
    flashcard.difficulty ||
    (flashcard.status === "accepted" ? "easy" : flashcard.status === "pending" ? "medium" : "hard");

  return {
    id: flashcard.id,
    front: flashcard.front,
    back: flashcard.back,
    revealed: false,
    categoryId: categoryId,
    categoryName: categoryName,
    difficulty: difficulty,
  };
}

// Calculate updated quiz stats
function calculateStats(cards: QuizFlashcardVM[], durationSeconds: number): QuizStatsVM {
  const total = cards.length;
  const correctCount = cards.filter((card) => card.userAnswer === "correct").length;
  const incorrectCount = cards.filter((card) => card.userAnswer === "incorrect").length;
  const percentCorrect = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  // Calculate per category stats
  const categoriesMap: Record<string, { correct: number; total: number }> = {};
  cards.forEach((card) => {
    if (card.categoryId) {
      if (!categoriesMap[card.categoryId]) {
        categoriesMap[card.categoryId] = { correct: 0, total: 0 };
      }

      categoriesMap[card.categoryId].total += 1;

      if (card.userAnswer === "correct") {
        categoriesMap[card.categoryId].correct += 1;
      }
    }
  });

  // Convert to percentage
  const categories: Record<string, number> = {};
  Object.entries(categoriesMap).forEach(([categoryId, stats]) => {
    categories[categoryId] = Math.round((stats.correct / stats.total) * 100);
  });

  return {
    total,
    correctCount,
    incorrectCount,
    percentCorrect,
    durationSeconds,
    categories,
  };
}

// Reducer function for managing quiz state
function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "LOAD_CARDS": {
      const quizCards = shuffleArray(action.payload).map(mapFlashcardToQuizVM);
      return {
        ...state,
        cards: quizCards,
        isLoading: false,
        error: null,
        currentIndex: 0,
        isFinished: quizCards.length === 0,
        stats: {
          ...state.stats,
          total: quizCards.length,
        },
      };
    }
    case "SET_ERROR": {
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    }
    case "SET_SESSION_OPTIONS": {
      return {
        ...state,
        sessionOptions: action.payload,
      };
    }
    case "SET_CATEGORIES": {
      return {
        ...state,
        categories: action.payload,
      };
    }
    case "REVEAL_ANSWER": {
      const updatedCards = [...state.cards];
      if (updatedCards[state.currentIndex]) {
        updatedCards[state.currentIndex] = {
          ...updatedCards[state.currentIndex],
          revealed: true,
        };
      }
      return {
        ...state,
        cards: updatedCards,
      };
    }
    case "MARK_ANSWER": {
      const updatedCards = [...state.cards];
      if (updatedCards[state.currentIndex]) {
        updatedCards[state.currentIndex] = {
          ...updatedCards[state.currentIndex],
          userAnswer: action.payload,
        };
      }
      return {
        ...state,
        cards: updatedCards,
      };
    }
    case "NEXT_CARD": {
      const nextIndex = state.currentIndex + 1;
      const isFinished = nextIndex >= state.cards.length;
      return {
        ...state,
        currentIndex: nextIndex,
        isFinished,
      };
    }
    case "RESTART_QUIZ": {
      // Reset user answers and shuffle cards
      const resetCards = shuffleArray(state.cards).map((card) => ({
        ...card,
        revealed: false,
        userAnswer: undefined,
      }));
      return {
        ...initialState,
        cards: resetCards,
        isLoading: false,
        sessionOptions: state.sessionOptions,
        categories: state.categories,
        stats: {
          ...initialState.stats,
          total: resetCards.length,
        },
      };
    }
    default:
      return state;
  }
}

// Interface for useQuizManager hook return value
interface UseQuizManagerReturn {
  state: QuizState;
  revealAnswer: () => void;
  markAnswer: (correct: boolean) => void;
  nextCard: () => void;
  restartQuiz: () => void;
  currentCard: QuizFlashcardVM | undefined;
  seconds: number;
  loadFlashcards: (sessionOptions: QuizSessionOptions) => Promise<void>;
  categories: FlashcardCategory[];
  startTimer: () => void;
}

/**
 * Custom hook for managing the quiz state and actions
 * @returns UseQuizManagerReturn - State and actions for quiz
 */
export function useQuizManager(): UseQuizManagerReturn {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const { seconds, start: startTimerInternal, stop, reset: resetTimer } = useTimer();
  const [categories, setCategories] = useState<FlashcardCategory[]>([]);
  // Używany do śledzenia, czy już załadowano karty
  const [isInitialized, setIsInitialized] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [timerStarted, setTimerStarted] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const categoryData = await getFlashcardCategories(supabase);
        setCategories(categoryData);
        dispatch({ type: "SET_CATEGORIES", payload: categoryData });
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }

    fetchCategories();
  }, []);

  // Obsługuj przekierowanie przez efekt
  useEffect(() => {
    if (redirectPath) {
      window.location.href = redirectPath;
    }
  }, [redirectPath]);

  // Effect to manage timer - zatrzymanie timera, gdy quiz jest zakończony
  useEffect(() => {
    // Stop timer when quiz is finished
    if (state.isFinished && timerStarted) {
      stop();
      setTimerStarted(false);
      console.log("Timer stopped due to quiz finish");
    }

    // Cleanup on unmount
    return () => {
      if (timerStarted) {
        stop();
      }
    };
  }, [state.isFinished, timerStarted, stop]);

  // Function to load flashcards with session options
  const loadFlashcards = useCallback(async (sessionOptions: QuizSessionOptions) => {
    try {
      // Reset timer state
      setTimerStarted(false);

      // Ustaw stan ładowania
      dispatch({ type: "SET_SESSION_OPTIONS", payload: sessionOptions });

      // Pobierz fiszki z wybranymi parametrami
      let data: FlashcardDTO[];
      if (sessionOptions.categoryId || sessionOptions.difficulty || sessionOptions.limit) {
        data = await getFilteredFlashcards(supabase, sessionOptions);
      } else {
        data = await getFlashcardsForQuiz(supabase);
      }

      // Zaktualizuj stan załadowanymi kartami
      dispatch({ type: "LOAD_CARDS", payload: data });

      // Oznacz, że inicjalizacja została wykonana
      setIsInitialized(true);
    } catch (error: unknown) {
      // Handle unauthorized errors - redirect to login
      if (error instanceof Object && "code" in error) {
        const pgError = error as PostgrestError;
        if (pgError.code === "401" || pgError.code === "PGRST301") {
          // Użyj efektu do przekierowania zamiast bezpośredniego window.location
          dispatch({ type: "SET_ERROR", payload: "Wymagane zalogowanie" });
          setRedirectPath("/login?redirect=/quiz");
          return;
        }
      }

      // Handle other errors
      const errorMessage =
        error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd podczas pobierania fiszek";

      dispatch({ type: "SET_ERROR", payload: errorMessage });
      setIsInitialized(true);
    }
  }, []);

  // Fetch flashcards tylko raz przy inicjalizacji
  useEffect(() => {
    if (!isInitialized) {
      loadFlashcards(state.sessionOptions);
    }
  }, [isInitialized, loadFlashcards, state.sessionOptions]);

  // Actions
  const revealAnswer = useCallback(() => {
    dispatch({ type: "REVEAL_ANSWER" });
  }, []);

  const markAnswer = useCallback((correct: boolean) => {
    dispatch({
      type: "MARK_ANSWER",
      payload: correct ? "correct" : "incorrect",
    });
  }, []);

  const nextCard = useCallback(() => {
    dispatch({ type: "NEXT_CARD" });
  }, []);

  const restartQuiz = useCallback(() => {
    resetTimer();
    dispatch({ type: "RESTART_QUIZ" });
    setTimerStarted(false);
  }, [resetTimer]);

  // Funkcja do rozpoczęcia timera
  const startTimer = useCallback(() => {
    // Zawsze resetujemy timer i uruchamiamy od nowa
    resetTimer();
    // Dodajemy małe opóźnienie przed uruchomieniem timera
    setTimeout(() => {
      startTimerInternal();
      setTimerStarted(true);
      console.log("Timer started in useQuizManager with timeout");
    }, 10);
  }, [startTimerInternal, resetTimer]);

  // Current card being displayed
  const currentCard = state.cards[state.currentIndex];

  // Update stats with current timer value
  const updatedStats = calculateStats(state.cards, seconds);

  return {
    state: {
      ...state,
      stats: updatedStats,
    },
    revealAnswer,
    markAnswer,
    nextCard,
    restartQuiz,
    currentCard,
    seconds,
    loadFlashcards,
    categories,
    startTimer,
  };
}
