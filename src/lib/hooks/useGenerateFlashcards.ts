import type { GenerateFlashcardsCommand, GenerateFlashcardsResponseDTO } from "../../types";

/**
 * Custom hook for handling flashcard generation API calls
 */
export function useGenerateFlashcards() {
  /**
   * Generates flashcards based on user input text
   * @param command - The generate flashcards command with user input
   * @returns A promise resolving to the generated flashcards response
   */
  const generateFlashcards = async (command: GenerateFlashcardsCommand): Promise<GenerateFlashcardsResponseDTO> => {
    try {
      const response = await fetch("/api/flashcards/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        // Try to get error message from response
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `Błąd serwera: ${response.status}`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating flashcards:", error);
      throw error instanceof Error ? error : new Error("Wystąpił nieoczekiwany błąd podczas generowania fiszek");
    }
  };

  return {
    generateFlashcards,
  };
}
