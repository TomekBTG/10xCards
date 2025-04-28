import type {
  CreateFlashcardCommand,
  FlashcardCategory,
  FlashcardDTO,
  FlashcardStatus,
  UpdateFlashcardCommand,
} from "../../types";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Serwis do zarządzania fiszkami
 */
export const flashcardService = {
  /**
   * Zapisuje pojedynczą fiszkę
   * @param flashcard - Komenda tworzenia fiszki
   * @returns Zapisana fiszka
   */
  async saveFlashcard(flashcard: CreateFlashcardCommand): Promise<FlashcardDTO> {
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(flashcard),
      });

      if (!response.ok) {
        // Próba pobrania komunikatu błędu z odpowiedzi
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `Błąd serwera: ${response.status}`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error("Error saving flashcard:", error);
      throw error instanceof Error ? error : new Error("Wystąpił nieoczekiwany błąd podczas zapisywania fiszki");
    }
  },

  /**
   * Zapisuje wiele fiszek jednocześnie
   * @param flashcards - Komenda tworzenia wielu fiszek
   * @returns Zapisane fiszki
   */
  async saveFlashcards(flashcards: CreateFlashcardCommand[]): Promise<FlashcardDTO[]> {
    try {
      // Zapisz fiszki w bazie danych przy użyciu Supabase
      const { data, error } = await supabase
        .from("flashcards")
        .insert(
          flashcards.map((f) => ({
            ...f,
            status: "accepted", // Wszystkie zapisywane fiszki są akceptowane
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))
        )
        .select("*");

      if (error) {
        throw new Error(`Błąd podczas zapisywania fiszek: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Error saving flashcards:", error);
      throw error instanceof Error ? error : new Error("Wystąpił nieoczekiwany błąd podczas zapisywania fiszek");
    }
  },

  /**
   * Aktualizuje status fiszki
   * @param id - Identyfikator fiszki
   * @param status - Nowy status fiszki
   * @returns Zaktualizowana fiszka
   */
  async updateFlashcardStatus(id: string, status: FlashcardStatus): Promise<FlashcardDTO> {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        // Próba pobrania komunikatu błędu z odpowiedzi
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `Błąd serwera: ${response.status}`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating flashcard status (id: ${id}):`, error);
      throw error instanceof Error
        ? error
        : new Error("Wystąpił nieoczekiwany błąd podczas aktualizacji statusu fiszki");
    }
  },

  /**
   * Aktualizuje zawartość fiszki
   * @param id - Identyfikator fiszki
   * @param command - Dane aktualizacji fiszki
   * @returns Zaktualizowana fiszka
   */
  async updateFlashcard(id: string, command: UpdateFlashcardCommand): Promise<FlashcardDTO> {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        // Próba pobrania komunikatu błędu z odpowiedzi
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `Błąd serwera: ${response.status}`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating flashcard (id: ${id}):`, error);
      throw error instanceof Error ? error : new Error("Wystąpił nieoczekiwany błąd podczas aktualizacji fiszki");
    }
  },

  /**
   * Gets all available flashcard categories with counts
   * @returns Promise resolving to categories with counts
   */
  async getCategories(): Promise<FlashcardCategory[]> {
    try {
      const { data, error } = await supabase.from("flashcards").select("category_id, category_name");

      if (error) {
        throw error;
      }

      // Group by category and count
      const categoryMap = new Map<string, { id: string; name: string; count: number }>();

      // Najpierw dodajmy kategorię dla fiszek bez kategorii
      let uncategorizedCount = 0;

      data?.forEach((card) => {
        if (!card.category_id || !card.category_name) {
          uncategorizedCount++;
        } else if (card.category_id && card.category_name) {
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

      // Jeśli mamy fiszki bez kategorii, dodajmy specjalną kategorię
      if (uncategorizedCount > 0) {
        categoryMap.set("uncategorized", {
          id: "uncategorized",
          name: "Bez kategorii",
          count: uncategorizedCount,
        });
      }

      // Convert map to array
      return Array.from(categoryMap.values());
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },
};
