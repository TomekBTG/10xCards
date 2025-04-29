/**
 * OpenRouter Service Configuration
 * 
 * Konfiguracja serwisu OpenRouter, w tym dostęp do klucza API i domyślne ustawienia.
 */

import type { ModelParameters } from './openrouter.types';

/**
 * Pobiera klucz API OpenRouter z zmiennych środowiskowych
 */
export function getOpenRouterApiKey(): string {
  const apiKey = import.meta.env.PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn('OpenRouter API key nie został skonfigurowany. Niektóre funkcje AI mogą być niedostępne.');
    return '';
  }
  return apiKey;
}

/**
 * Dostępne modele OpenRouter
 */
export const OPENROUTER_MODELS = {
  GPT4: 'gpt-4',
  GPT35_TURBO: 'gpt-3.5-turbo',
  CLAUDE_3_OPUS: 'anthropic/claude-3-opus',
  CLAUDE_3_SONNET: 'anthropic/claude-3-sonnet',
  CLAUDE_3_HAIKU: 'anthropic/claude-3-haiku',
  MISTRAL_LARGE: 'mistralai/mistral-large',
  GPT4O_MINI: 'openai/gpt-4o-mini'
};

/**
 * Domyślny model do użycia, gdy nie określono konkretnego modelu
 */
export const DEFAULT_MODEL = OPENROUTER_MODELS.GPT4O_MINI;

/**
 * Domyślne parametry dla modeli
 */
export const DEFAULT_MODEL_PARAMS: ModelParameters = {
  temperature: 0.7,
  max_tokens: 150
};

/**
 * Parametry modelu zoptymalizowane dla generowania fiszek
 */
export const FLASHCARD_GENERATION_PARAMS: ModelParameters = {
  temperature: 0.2, // Niższy temperature dla bardziej deterministycznych odpowiedzi
  max_tokens: 500,  // Więcej tokenów dla generowania dłuższych fiszek
  top_p: 0.95,      // Wysoki top_p dla różnorodności przy zachowaniu trafności
  model: OPENROUTER_MODELS.GPT4O_MINI // Model zoptymalizowany pod kątem stosunku ceny do jakości
};

/**
 * Parametry modelu zoptymalizowane dla kreatywnych odpowiedzi
 */
export const CREATIVE_RESPONSE_PARAMS: ModelParameters = {
  temperature: 0.9, // Wyższy temperature dla bardziej kreatywnych odpowiedzi
  max_tokens: 300,
  top_p: 0.98,      // Wyższy top_p dla większej kreatywności
  model: OPENROUTER_MODELS.GPT4O_MINI // Model o wysokiej jakości dla kreatywnych zadań
};

/**
 * Endpoint API OpenRouter
 */
export const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Liczba prób ponowienia w przypadku błędów
 */
export const RETRY_COUNT = 3;

/**
 * Timeout dla żądań w milisekundach (30 sekund)
 */
export const REQUEST_TIMEOUT = 30000; 