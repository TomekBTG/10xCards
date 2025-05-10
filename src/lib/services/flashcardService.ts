import type {
  CreateFlashcardCommand,
  FlashcardCategory,
  FlashcardDTO,
  FlashcardStatus,
  UpdateFlashcardCommand,
  FlashcardsListResponseDTO,
} from "../../types";
import { supabaseClient } from "../../db/supabase.client";
import { v4 as uuidv4 } from "uuid";

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
      console.log("saveFlashcards - otrzymane dane:", JSON.stringify(flashcards));

      // Pobieramy aktualnego użytkownika
      const { data: userData } = await supabaseClient.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        throw new Error("Nie znaleziono ID użytkownika. Proszę zalogować się ponownie.");
      }

      // Przygotuj dane fiszek do zapisu
      const flashcardsToInsert = flashcards.map((f) => {
        const flashcardData = {
          ...f,
          user_id: userId,
          status: "accepted", // Wszystkie zapisywane fiszki są akceptowane
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Upewnij się, że category_name jest używane tylko dla nowych kategorii
        if (flashcardData.category_id) {
          // Jeśli istnieje category_id, to nie używamy category_name
          delete flashcardData.category_name;
          console.log("Używanie istniejącej kategorii:", flashcardData.category_id);
        } else if (flashcardData.category_name) {
          // Jeśli nie ma category_id, ale jest category_name, to tworzymy nową kategorię
          // Generujemy nowe ID dla kategorii, ponieważ baza danych wymaga niepustej wartości
          const newCategoryId = uuidv4();
          console.log("Tworzenie nowej kategorii:", flashcardData.category_name, "z ID:", newCategoryId);
          flashcardData.category_id = newCategoryId;
        } else {
          // Jeśli nie ma ani category_id, ani category_name, to fiszka jest bez kategorii
          // Ale category_id nie może być null, więc ustawiamy specjalną wartość
          console.log("Fiszka bez kategorii");
          flashcardData.category_id = "uncategorized";
          delete flashcardData.category_name;
        }

        // Logowanie każdej fiszki przed zapisem
        console.log("Fiszka do zapisania:", JSON.stringify(flashcardData));

        return flashcardData;
      });

      // Zapisz fiszki w bazie danych przy użyciu Supabase
      const { data, error } = await supabaseClient.from("flashcards").insert(flashcardsToInsert).select("*");

      if (error) {
        console.error("Błąd Supabase podczas zapisywania fiszek:", error);
        throw new Error(`Błąd podczas zapisywania fiszek: ${error.message}`);
      }

      console.log("Zapisane fiszki z Supabase:", JSON.stringify(data));
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
   * Pobiera fiszki z opcjonalnym filtrowaniem i paginacją
   * @param options - Opcje filtrowania i paginacji
   * @returns Odpowiedź zawierająca listę fiszek i informacje o paginacji
   */
  async getFlashcards(options?: {
    status?: FlashcardStatus;
    categoryId?: string;
    difficulty?: string;
    createdBefore?: string;
    createdAfter?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<FlashcardsListResponseDTO> {
    try {
      const {
        status,
        categoryId,
        difficulty,
        createdBefore,
        createdAfter,
        sort = "created_at.desc",
        page = 1,
        limit = 20,
      } = options || {};

      // Obliczanie offsetu na podstawie strony i limitu
      const offset = (page - 1) * limit;

      // Budowanie zapytania
      let query = supabaseClient.from("flashcards").select("*", { count: "exact" });

      // Zastosowanie filtrów
      if (status) {
        query = query.eq("status", status);
      }

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      if (difficulty) {
        query = query.eq("difficulty", difficulty);
      }

      if (createdBefore) {
        query = query.lte("created_at", createdBefore);
      }

      if (createdAfter) {
        query = query.gte("created_at", createdAfter);
      }

      // Zastosowanie sortowania
      const [sortField, sortOrder] = sort.split(".");
      if (sortField && sortOrder) {
        query = query.order(sortField, { ascending: sortOrder === "asc" });
      }

      // Zastosowanie paginacji
      query = query.range(offset, offset + limit - 1);

      // Wykonanie zapytania
      const { data: flashcards, error, count } = await query;

      if (error) {
        throw new Error(`Błąd bazy danych: ${error.message}`);
      }

      return {
        data: flashcards || [],
        pagination: { page, limit, total: count || 0 },
      };
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      throw error instanceof Error ? error : new Error("Wystąpił nieoczekiwany błąd podczas pobierania fiszek");
    }
  },

  /**
   * Gets all available flashcard categories with counts
   * @returns Promise resolving to categories with counts
   */
  async getCategories(): Promise<FlashcardCategory[]> {
    try {
      const { data, error } = await supabaseClient.from("flashcards").select("category_id, category_name");

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
