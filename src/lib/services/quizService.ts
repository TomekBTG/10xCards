import type { FlashcardDTO, FlashcardCategory, QuizSessionOptions, QuizFlashcardVM } from "../../types";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Fetch all flashcards for the currently authenticated user
 * @param {SupabaseClient} supabase - The Supabase client instance
 * @returns {Promise<FlashcardDTO[]>} - A promise that resolves to an array of flashcards
 */
export async function getFlashcardsForQuiz(supabase: SupabaseClient): Promise<FlashcardDTO[]> {
  const { data, error } = await supabase.from("flashcards").select("*");

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Fetch flashcards based on session parameters
 * @param {SupabaseClient} supabase - The Supabase client instance
 * @param {QuizSessionOptions} sessionOptions - Session configuration parameters
 * @returns {Promise<FlashcardDTO[]>} - A promise that resolves to an array of flashcards matching the parameters
 */
export async function getFilteredFlashcards(
  supabase: SupabaseClient,
  sessionOptions: QuizSessionOptions
): Promise<FlashcardDTO[]> {
  let query = supabase.from("flashcards").select("*");

  // Apply session parameters
  if (sessionOptions.categoryId) {
    query = query.eq("category_id", sessionOptions.categoryId);
  }

  if (sessionOptions.status) {
    query = query.eq("status", sessionOptions.status);
  }

  if (sessionOptions.difficulty) {
    query = query.eq("difficulty", sessionOptions.difficulty);
  }

  // Apply limit if provided
  if (sessionOptions.limit && sessionOptions.limit > 0) {
    query = query.limit(sessionOptions.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get all available flashcard categories with counts
 * @param {SupabaseClient} supabase - The Supabase client instance
 * @returns {Promise<FlashcardCategory[]>} - A promise that resolves to categories with counts
 */
export async function getFlashcardCategories(supabase: SupabaseClient): Promise<FlashcardCategory[]> {
  try {
    const { data, error } = await supabase.from("flashcards").select("category_id, category_name");

    if (error) {
      throw error;
    }

    // Group by category and count
    const categoryMap = new Map<string, { id: string; name: string; count: number }>();

    data?.forEach((card) => {
      if (card.category_id && card.category_name) {
        if (categoryMap.has(card.category_id)) {
          const category = categoryMap.get(card.category_id);
          if (category) {
            categoryMap.set(card.category_id, {
              ...category,
              count: category.count + 1,
            });
          }
        } else {
          categoryMap.set(card.category_id, {
            id: card.category_id,
            name: card.category_name,
            count: 1,
          });
        }
      }
    });

    // Convert map to array
    return Array.from(categoryMap.values());
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {T[]} array - The array to shuffle
 * @returns {T[]} - A new shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Format seconds into mm:ss format
 * @param {number} totalSeconds - Total seconds to format
 * @returns {string} - Formatted time string in mm:ss format
 */
export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Calculate category statistics from answered cards
 * @param {QuizFlashcardVM[]} cards - Array of flashcards with answers
 * @returns {Record<string, number>} - Object mapping category IDs to correct percentage
 */
export function calculateCategoryStats(cards: QuizFlashcardVM[]): Record<string, number> {
  // Zaimplementuj statystyki kategorii w oparciu o nowe kategorie
  const categoryStats: Record<string, { correct: number; total: number }> = {};

  // Grupuj według kategoriami i licz poprawne/niepoprawne odpowiedzi
  cards.forEach((card) => {
    if (card.categoryId) {
      if (!categoryStats[card.categoryId]) {
        categoryStats[card.categoryId] = { correct: 0, total: 0 };
      }

      categoryStats[card.categoryId].total += 1;

      if (card.userAnswer === "correct") {
        categoryStats[card.categoryId].correct += 1;
      }
    }
  });

  // Oblicz procenty
  const result: Record<string, number> = {};
  Object.entries(categoryStats).forEach(([categoryId, stats]) => {
    result[categoryId] = Math.round((stats.correct / stats.total) * 100);
  });

  return result;
}
