import type { SupabaseClient } from "@supabase/supabase-js";
import type { QuizStatsVM } from "../../types";

export interface QuizResultDTO {
  id: string;
  user_id: string;
  created_at: string;
  category_id: string | null;
  difficulty: string | null;
  limit_count: number;
  total_cards: number;
  correct_count: number;
  incorrect_count: number;
  percent_correct: number;
  duration_seconds: number;
  category_stats: Record<string, number>;
}

/**
 * Zapisuje wyniki quizu do bazy danych
 * @param supabase - Klient Supabase
 * @param userId - ID użytkownika
 * @param stats - Statystyki quizu
 * @param sessionOptions - Opcje sesji
 * @returns Promise zawierający wynik operacji
 */
export async function saveQuizResults(
  supabase: SupabaseClient,
  userId: string,
  stats: QuizStatsVM,
  sessionOptions: {
    categoryId: string | null;
    difficulty: string | null;
    limit: number;
  }
) {
  try {
    // Utwórz rekord do zapisania w bazie
    const quizResult = {
      user_id: userId,
      category_id: sessionOptions.categoryId,
      difficulty: sessionOptions.difficulty,
      limit_count: sessionOptions.limit || 10, // Domyślna wartość 10, jeśli limit jest undefined
      total_cards: stats.total,
      correct_count: stats.correctCount,
      incorrect_count: stats.incorrectCount,
      percent_correct: stats.percentCorrect,
      duration_seconds: stats.durationSeconds,
      category_stats: stats.categories || {}, // Pusta mapa, jeśli categories jest undefined
    };

    // Zapisz wyniki do bazy danych
    const { data, error } = await supabase.from("quiz_results").insert(quizResult).select();

    if (error) {
      console.error("Błąd podczas zapisywania wyników quizu:", error);
      throw new Error(`Nie udało się zapisać wyników: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Nieoczekiwany błąd podczas zapisywania wyników:", error);
    throw new Error("Wystąpił błąd podczas zapisywania wyników quizu");
  }
}

/**
 * Pobiera historię wyników quizu dla użytkownika
 * @param supabase - Klient Supabase
 * @param limit - Maksymalna liczba wyników do pobrania
 * @returns Promise zawierający listę wyników quizu
 */
export async function getQuizResultsHistory(supabase: SupabaseClient, limit = 10): Promise<QuizResultDTO[]> {
  try {
    const { data, error } = await supabase
      .from("quiz_results")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Błąd podczas pobierania historii quizu:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Nieoczekiwany błąd podczas pobierania historii quizu:", error);
    throw new Error("Wystąpił błąd podczas pobierania historii wyników quizu");
  }
}

/**
 * Pobiera szczegóły wyniku quizu
 * @param supabase - Klient Supabase
 * @param resultId - ID wyniku quizu
 * @returns Promise zawierający szczegóły wyniku quizu
 */
export async function getQuizResultDetails(supabase: SupabaseClient, resultId: string): Promise<QuizResultDTO | null> {
  try {
    const { data, error } = await supabase.from("quiz_results").select("*").eq("id", resultId).single();

    if (error) {
      console.error("Błąd podczas pobierania szczegółów wyniku quizu:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Nieoczekiwany błąd podczas pobierania szczegółów wyniku quizu:", error);
    throw new Error("Wystąpił błąd podczas pobierania szczegółów wyniku quizu");
  }
}

// Eksportowany obiekt serwisu
export const quizResultsService = {
  saveQuizResults,
  getQuizResultsHistory,
  getQuizResultDetails,
};
