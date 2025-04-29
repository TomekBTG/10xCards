import type { FlashcardDTO } from "../../types";
import { OpenRouterService } from "./openrouter.service";
import {
  getOpenRouterApiKey,
  FLASHCARD_GENERATION_PARAMS,
  DEFAULT_MODEL,
  DEFAULT_MODEL_PARAMS
} from "./openrouter.config";
import type { ResponseFormat } from "./openrouter.types";

/**
 * Service for generating flashcards using AI
 */
export const aiService = {
  /**
   * Inicjalizuje serwis OpenRouter z aktualnymi ustawieniami
   * @returns Instancja serwisu OpenRouter
   */
  _initOpenRouterService(): OpenRouterService {
    const apiKey = getOpenRouterApiKey();
    return new OpenRouterService({
      apiKey,
      defaultModelName: DEFAULT_MODEL,
      defaultModelParams: DEFAULT_MODEL_PARAMS
    });
  },

  /**
   * Generuje fiszkę (pytanie-odpowiedź) dla podanego tekstu wejściowego
   * @param inputText - Tekst, na podstawie którego należy wygenerować fiszkę
   * @returns Wygenerowana fiszka
   */
  async generateSingleFlashcard(inputText: string): Promise<Partial<FlashcardDTO>> {
    try {
      const openRouter = this._initOpenRouterService();
      
      // Definiowanie formatu JSON dla odpowiedzi
      const responseFormat: ResponseFormat = {
        type: 'json_schema',
        json_schema: {
          name: 'flashcard',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              front: { type: 'string' },
              back: { type: 'string' },
              difficulty: { 
                type: 'string',
                enum: ["easy", "medium", "hard"]
              }
            },
            required: ['front', 'back', 'difficulty'],
            additionalProperties: false
          }
        }
      };
      
      // System message z instrukcjami dla modelu
      const systemMessage = `
        You are an AI specialized in creating flashcards for learning purposes.
        Create a single flashcard based on the provided content.
        The front side should contain a question or concept.
        The back side should contain a comprehensive explanation or answer.
        Assess the difficulty level (easy, medium, hard) based on the complexity of the concept.
      `;
      
      // Przygotowanie payloadu
      const payload = openRouter.buildRequestPayload(
        systemMessage,
        inputText,
        FLASHCARD_GENERATION_PARAMS,
        responseFormat
      );
      
      // Wysłanie żądania
      const response = await openRouter.sendRequest(payload);
      
      // Przygotowanie fiszki
      const currentTime = new Date().toISOString();
      return {
        front: response.content.front,
        back: response.content.back,
        difficulty: response.content.difficulty,
        status: "pending",
        is_ai_generated: true,
        created_at: currentTime,
        updated_at: currentTime
      };
    } catch (error) {
      console.error("Error generating flashcard:", error);
      throw error instanceof Error 
        ? error 
        : new Error("Wystąpił nieoczekiwany błąd podczas generowania fiszki");
    }
  },

  /**
   * Generates flashcards based on user input text
   * @param userInput - Text provided by the user for flashcard generation
   * @param categoryId - Optional category ID for the generated flashcards
   * @param categoryName - Optional category name for the generated flashcards
   * @returns Array of generated flashcards
   */
  async generateFlashcards(
    userInput: string,
    categoryId?: string,
    categoryName?: string
  ): Promise<Partial<FlashcardDTO>[]> {
    try {
      // Sprawdź, czy klucz API jest dostępny
      const apiKey = getOpenRouterApiKey();
      
      // Jeśli nie ma klucza API, użyj metody zastępczej
      if (!apiKey) {
        return this._generateMockFlashcards(userInput, categoryId, categoryName);
      }
      
      const openRouter = this._initOpenRouterService();
      
      // Definiowanie formatu JSON dla odpowiedzi
      const responseFormat: ResponseFormat = {
        type: 'json_schema',
        json_schema: {
          name: 'flashcards',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              flashcards: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    front: { type: 'string' },
                    back: { type: 'string' },
                    difficulty: { 
                      type: 'string',
                      enum: ["easy", "medium", "hard"]
                    }
                  },
                  required: ['front', 'back', 'difficulty'],
                  additionalProperties: false
                }
              }
            },
            required: ['flashcards'],
            additionalProperties: false
          }
        }
      };
      
      // System message z instrukcjami dla modelu
      const systemMessage = `
        You are an AI specialized in creating flashcards for learning purposes.
        Create a set of 5-10 flashcards based on the provided content.
        For each flashcard:
        - The front side should contain a clear question or concept
        - The back side should contain a comprehensive explanation or answer
        - Assess difficulty as "easy", "medium", or "hard" based on the concept complexity
        
        Focus on the most important concepts from the provided content.
        Make sure the questions are diverse and cover different aspects of the material.
        ${categoryName ? `These flashcards are for the category: ${categoryName}` : ''}
      `;
      
      // Przygotowanie payloadu
      const payload = openRouter.buildRequestPayload(
        systemMessage,
        userInput,
        FLASHCARD_GENERATION_PARAMS,
        responseFormat
      );
      
      // Wysłanie żądania
      const response = await openRouter.sendRequest(payload);
      
      // Przekształcenie odpowiedzi na fiszki
      const currentTime = new Date().toISOString();
      const flashcards = response.content.flashcards.map((item: any) => ({
        front: item.front,
        back: item.back,
        difficulty: item.difficulty,
        status: "pending" as const,
        is_ai_generated: true,
        created_at: currentTime,
        updated_at: currentTime,
        category_id: categoryId,
        category_name: categoryName
      }));
      
      return flashcards;
    } catch (error) {
      console.error("Error generating flashcards:", error);
      // W przypadku błędu, użyj metody zastępczej
      return this._generateMockFlashcards(userInput, categoryId, categoryName);
    }
  },
  
  /**
   * Generates mock flashcards when AI service is unavailable
   * @private
   */
  async _generateMockFlashcards(
    userInput: string,
    categoryId?: string,
    categoryName?: string
  ): Promise<Partial<FlashcardDTO>[]> {
    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate 5-15 flashcards based on input length
    const numFlashcards = Math.min(5 + Math.floor(userInput.length / 1000), 15);

    // Create sample flashcards with content derived from input
    const flashcards: Partial<FlashcardDTO>[] = [];

    // Wygeneruj poziomy trudności w rozsądnych proporcjach
    const difficulties: ("easy" | "medium" | "hard")[] = ["easy", "medium", "hard"];

    for (let i = 0; i < numFlashcards; i++) {
      const startPos = Math.floor(Math.random() * Math.max(userInput.length - 50, 0));
      const frontLength = Math.min(Math.floor(Math.random() * 150) + 50, 200);
      const frontSnippet = userInput.slice(startPos, startPos + frontLength);

      // Automatycznie przydziel poziom trudności dla każdej fiszki
      const randomDifficultyIndex = Math.floor(Math.random() * difficulties.length);
      const difficulty = difficulties[randomDifficultyIndex];

      flashcards.push({
        front: `Question ${i + 1}: ${frontSnippet.slice(0, 150)}...`,
        back: `Answer ${i + 1}: This is a generated answer for the question`,
        status: "pending",
        is_ai_generated: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category_id: categoryId,
        category_name: categoryName,
        difficulty: difficulty,
      });
    }

    return flashcards;
  },
  
  /**
   * Zmienia sposób sformułowania tekstu bez zmiany jego znaczenia
   * @param text - Tekst do przeformułowania
   * @returns Przeformułowany tekst
   */
  async rephrase(text: string): Promise<string> {
    try {
      // Sprawdź, czy klucz API jest dostępny
      const apiKey = getOpenRouterApiKey();
      
      // Jeśli nie ma klucza API, zwróć oryginalny tekst
      if (!apiKey) {
        console.warn('OpenRouter API key nie jest dostępny. Funkcja przeformułowania jest niedostępna.');
        return text;
      }
      
      const openRouter = this._initOpenRouterService();
      
      // System message z instrukcjami dla modelu
      const systemMessage = `
        You are an AI assistant specialized in rephrasing text.
        Rephrase the provided text to improve its clarity and readability without changing its meaning.
        Maintain all key information and concepts from the original text.
        Return only the rephrased text, with no additional commentary.
      `;
      
      // Przygotowanie payloadu
      const payload = openRouter.buildRequestPayload(
        systemMessage,
        text
      );
      
      // Wysłanie żądania
      const response = await openRouter.sendRequest(payload);
      
      return typeof response.content === 'string' 
        ? response.content 
        : response.content.toString();
    } catch (error) {
      console.error("Error rephrasing text:", error);
      // W przypadku błędu, zwróć oryginalny tekst
      return text;
    }
  }
};
