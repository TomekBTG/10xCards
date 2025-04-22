import type { FlashcardDTO } from "../../types";

/**
 * Service for generating flashcards using AI
 */
export const aiService = {
  /**
   * Generates flashcards based on user input text
   * @param userInput - Text provided by the user for flashcard generation
   * @returns Array of generated flashcards
   */
  async generateFlashcards(userInput: string): Promise<Partial<FlashcardDTO>[]> {
    // This is a simplified implementation that would be replaced with actual AI service integration
    // In a real implementation, this would call an AI API like OpenAI

    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate 5-15 flashcards based on input length
    const numFlashcards = Math.min(5 + Math.floor(userInput.length / 1000), 15);

    // Create sample flashcards with content derived from input
    const flashcards: Partial<FlashcardDTO>[] = [];

    for (let i = 0; i < numFlashcards; i++) {
      const startPos = Math.floor(Math.random() * Math.max(userInput.length - 50, 0));
      const frontLength = Math.min(Math.floor(Math.random() * 150) + 50, 200);
      const frontSnippet = userInput.slice(startPos, startPos + frontLength);

      flashcards.push({
        front: `Question ${i + 1}: ${frontSnippet.slice(0, 150)}...`,
        back: `Answer ${i + 1}: This is a generated answer for the question`,
        status: "pending",
        is_ai_generated: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return flashcards;
  },
};
