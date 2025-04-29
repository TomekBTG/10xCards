/**
 * OpenRouter Service - Examples
 * 
 * Ten plik zawiera przykłady użycia serwisu OpenRouter do różnych scenariuszy.
 */

import { OpenRouterService } from './openrouter.service';
import type { ResponseFormat } from './openrouter.types';
import { FLASHCARD_GENERATION_PARAMS } from './openrouter.config';
import type { FlashcardDTO } from '../../types';

/**
 * Przykład 1: Podstawowe użycie serwisu OpenRouter
 * 
 * Ten przykład pokazuje, jak utworzyć instancję serwisu i wysłać proste zapytanie.
 */
async function basicUsageExample() {
  // Utworzenie instancji serwisu z kluczem API
  const openRouter = new OpenRouterService({
    apiKey: import.meta.env.PUBLIC_OPENROUTER_API_KEY || '',
    defaultModelName: 'gpt-4'
  });
  
  // Przygotowanie komunikatów
  const systemMessage = 'You are a helpful assistant.';
  const userMessage = 'What is the capital of France?';
  
  try {
    // Utworzenie payloadu i wysłanie zapytania
    const payload = openRouter.buildRequestPayload(systemMessage, userMessage);
    const response = await openRouter.sendRequest(payload);
    
    console.log('Response content:', response.content);
    return response.content;
  } catch (error) {
    console.error('Error in basic usage example:', error);
    throw error;
  }
}

/**
 * Przykład 2: Użycie serwisu OpenRouter z niestandardowymi parametrami modelu
 * 
 * Ten przykład pokazuje, jak dostosować parametry modelu.
 */
async function customParametersExample() {
  // Utworzenie instancji serwisu
  const openRouter = new OpenRouterService({
    apiKey: import.meta.env.PUBLIC_OPENROUTER_API_KEY || '',
    defaultModelName: 'anthropic/claude-3-opus'
  });
  
  // Przygotowanie komunikatów
  const systemMessage = 'You are a creative writing assistant.';
  const userMessage = 'Write a short poem about technology.';
  
  // Niestandardowe parametry modelu
  const modelParams = {
    temperature: 0.9,
    max_tokens: 300,
    top_p: 0.95
  };
  
  try {
    // Utworzenie payloadu z niestandardowymi parametrami
    const payload = openRouter.buildRequestPayload(
      systemMessage,
      userMessage,
      modelParams
    );
    
    const response = await openRouter.sendRequest(payload);
    console.log('Creative response:', response.content);
    return response.content;
  } catch (error) {
    console.error('Error in custom parameters example:', error);
    throw error;
  }
}

/**
 * Przykład 3: Użycie serwisu OpenRouter ze strukturyzowaną odpowiedzią (JSON Schema)
 * 
 * Ten przykład pokazuje, jak wymusić odpowiedź w określonym formacie JSON.
 */
async function structuredResponseExample() {
  // Utworzenie instancji serwisu
  const openRouter = new OpenRouterService({
    apiKey: import.meta.env.PUBLIC_OPENROUTER_API_KEY || '',
    defaultModelName: 'gpt-4'
  });
  
  // Przygotowanie komunikatów
  const systemMessage = 'You are an API that returns structured data about movies.';
  const userMessage = 'Give me information about the movie Inception.';
  
  // Definicja formatu odpowiedzi jako JSON Schema
  const responseFormat: ResponseFormat = {
    type: 'json_schema',
    json_schema: {
      name: 'movie_info',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          director: { type: 'string' },
          year: { type: 'number' },
          rating: { type: 'number' },
          plot: { type: 'string' },
          actors: {
            type: 'array',
            items: { type: 'string' }
          }
        },
        required: ['title', 'director', 'year', 'plot']
      }
    }
  };
  
  try {
    // Utworzenie payloadu z formatem odpowiedzi
    const payload = openRouter.buildRequestPayload(
      systemMessage,
      userMessage,
      undefined, // używamy domyślnych parametrów modelu
      responseFormat
    );
    
    const response = await openRouter.sendRequest(payload);
    
    // Odpowiedź jest już sparsowana do obiektu JSON
    console.log('Movie information:', response.content);
    
    // Możemy bezpośrednio pracować ze strukturyzowanymi danymi
    if (response.content && response.content.title) {
      console.log(`Movie title: ${response.content.title} (${response.content.year})`);
    }
    
    return response.content;
  } catch (error) {
    console.error('Error in structured response example:', error);
    throw error;
  }
}

/**
 * Przykład 4: Generowanie fiszek za pomocą OpenRouter
 * 
 * Ten przykład pokazuje, jak wygenerować zestaw fiszek dla podanego tekstu.
 */
async function generateFlashcardsExample() {
  // Utworzenie instancji serwisu
  const openRouter = new OpenRouterService({
    apiKey: import.meta.env.PUBLIC_OPENROUTER_API_KEY || '',
    defaultModelName: 'anthropic/gpt-4o-mini'
  });
  
  // Tekst do analizy
  const learningText = `
    Metody numeryczne to techniki matematyczne służące do rozwiązywania problemów matematycznych, 
    które nie mają analitycznego rozwiązania lub gdy analityczne rozwiązanie jest zbyt skomplikowane.
    
    Metoda Newtona-Raphsona to iteracyjna metoda znajdowania przybliżonej wartości miejsca zerowego 
    funkcji różniczkowalnej. Wykorzystuje ona pochodną funkcji do wyznaczenia lepszego przybliżenia 
    wartości miejsca zerowego. Wzór iteracyjny to: x_{n+1} = x_n - f(x_n)/f'(x_n).
    
    Metoda bisekcji (połowienia przedziału) to prosta metoda znajdowania przybliżonej wartości 
    miejsca zerowego funkcji ciągłej. Polega na dzieleniu przedziału, w którym znajduje się 
    miejsce zerowe, na dwie równe części i wybieraniu tej części, w której funkcja zmienia znak.
    
    Metoda eliminacji Gaussa służy do rozwiązywania układów równań liniowych poprzez sprowadzenie 
    macierzy współczynników do postaci schodkowej górnej.
  `;
  
  // Definicja formatu odpowiedzi jako JSON Schema
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
              required: ['front', 'back', 'difficulty']
            }
          }
        },
        required: ['flashcards']
      }
    }
  };
  
  try {
    // System message z instrukcjami dla modelu
    const systemMessage = `
      You are an AI specialized in creating flashcards for learning purposes.
      Create a set of 3-5 flashcards based on the provided content.
      For each flashcard:
      - The front side should contain a clear question or concept
      - The back side should contain a comprehensive explanation or answer
      - Assess difficulty as "easy", "medium", or "hard" based on the concept complexity
      
      Focus on the most important concepts from the provided content.
      Make sure the questions are diverse and cover different aspects of the material.
    `;
    
    // Przygotowanie payloadu
    const payload = openRouter.buildRequestPayload(
      systemMessage,
      learningText,
      FLASHCARD_GENERATION_PARAMS,
      responseFormat
    );
    
    // Wysłanie żądania
    const response = await openRouter.sendRequest(payload);
    
    // Przekształcenie odpowiedzi na fiszki
    const currentTime = new Date().toISOString();
    const flashcards: Partial<FlashcardDTO>[] = response.content.flashcards.map((item: any) => ({
      front: item.front,
      back: item.back,
      difficulty: item.difficulty,
      status: "pending",
      is_ai_generated: true,
      created_at: currentTime,
      updated_at: currentTime
    }));
    
    console.log(`Generated ${flashcards.length} flashcards`);
    flashcards.forEach((card, index) => {
      console.log(`\nFlashcard ${index + 1} (${card.difficulty}):`);
      console.log(`Q: ${card.front}`);
      console.log(`A: ${card.back}`);
    });
    
    return flashcards;
  } catch (error) {
    console.error('Error in flashcard generation example:', error);
    throw error;
  }
}

// Eksport przykładów
export const openRouterExamples = {
  basicUsageExample,
  customParametersExample,
  structuredResponseExample,
  generateFlashcardsExample
}; 