import type {
  CreateFlashcardCommand,
  FlashcardCategory,
  FlashcardDTO,
  FlashcardStatus,
  UpdateFlashcardCommand,
  FlashcardsListResponseDTO,
} from "../../types";
import { supabaseClient } from "../../db/supabase.client";
import { categoryService } from "./categoryService";

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

      // Przygotuj dane fiszek do zapisu z obsługą kategorii
      const flashcardsWithProcessedCategories = await Promise.all(
        flashcards.map(async (f) => {
          // Podstawowe dane fiszki
          const flashcardData = {
            ...f,
            user_id: userId,
            status: "accepted", // Wszystkie zapisywane fiszki są akceptowane
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Obsługa kategorii
          if (flashcardData.category_id) {
            // Jeśli podano ID kategorii, używamy go
            console.log("Używanie istniejącej kategorii:", flashcardData.category_id);
            // Usuwamy category_name, bo tabela flashcards nie ma już tego pola po migracji
            delete flashcardData.category_name;
          } else if (flashcardData.category_name) {
            // Jeśli podano tylko nazwę kategorii, znajdź lub utwórz kategorię
            console.log("Szukanie lub tworzenie kategorii:", flashcardData.category_name);
            const category = await categoryService.getOrCreateCategory(flashcardData.category_name);

            if (category) {
              console.log("Znaleziono/utworzono kategorię:", category.name, "z ID:", category.id);
              flashcardData.category_id = category.id;
              // Usuwamy category_name, bo tabela flashcards nie ma już tego pola po migracji
              delete flashcardData.category_name;
            } else {
              console.error("Nie udało się utworzyć kategorii:", flashcardData.category_name);
              // Używamy domyślnej kategorii, jeśli nie udało się utworzyć
              const defaultCategory = await categoryService.getOrCreateCategory("Domyślna kategoria");
              flashcardData.category_id = defaultCategory?.id || "uncategorized";
              delete flashcardData.category_name;
            }
          } else {
            // Jeśli nie podano ani ID ani nazwy kategorii, użyj domyślnej
            console.log("Brak danych kategorii - używam domyślnej kategorii");
            const defaultCategory = await categoryService.getOrCreateCategory("Domyślna kategoria");
            flashcardData.category_id = defaultCategory?.id || "uncategorized";
            delete flashcardData.category_name;
          }

          return flashcardData;
        })
      );

      // Logowanie przetworzonych fiszek
      console.log(
        "Fiszki po przetworzeniu kategorii:",
        flashcardsWithProcessedCategories.map((f) => ({
          front: f.front?.substring(0, 20) + "...",
          category_id: f.category_id,
        }))
      );

      // Zapisz fiszki w bazie danych przy użyciu Supabase
      const { data, error } = await supabaseClient
        .from("flashcards")
        .insert(flashcardsWithProcessedCategories)
        .select("*");

      if (error) {
        console.error("Błąd Supabase podczas zapisywania fiszek:", error);
        throw new Error(`Błąd podczas zapisywania fiszek: ${error.message}`);
      }

      console.log("Zapisano pomyślnie", data?.length || 0, "fiszek");
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
      // Jeśli aktualizujemy kategorię po nazwie, najpierw przetwórzmy to na ID
      if (command.category_name && !command.category_id) {
        const category = await categoryService.getOrCreateCategory(command.category_name);
        if (category) {
          command.category_id = category.id;
          delete command.category_name; // Usuwamy category_name, bo tabela nie ma już tego pola
        }
      } else if (command.category_name) {
        // Jeśli podano zarówno ID jak i nazwę, priorytet ma ID
        delete command.category_name;
      }

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
   * Pobiera kategorie fiszek
   * @returns Lista kategorii z liczbą fiszek
   */
  async getCategories(): Promise<FlashcardCategory[]> {
    return categoryService.getCategories();
  },
};
