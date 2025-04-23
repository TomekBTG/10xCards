import type {
  FlashcardDTO,
  FlashcardStatus,
  CreateFlashcardCommand,
  CreateFlashcardsCommand,
  UpdateFlashcardCommand,
} from "../../types";

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
      const command: CreateFlashcardsCommand = {
        flashcards: flashcards,
      };

      const response = await fetch("/api/flashcards/batch", {
        method: "POST",
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
      console.error("Error saving multiple flashcards:", error);
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
};
