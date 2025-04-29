# OpenRouter Service Implementation Plan

## 1. Opis usługi
OpenRouter Service to moduł integrujący interfejs API OpenRouter, którego celem jest wzbogacenie interakcji czatu o mechanizmy oparte na dużych modelach językowych (LLM). Usługa umożliwia dynamiczne konfigurowanie komunikatów systemowych i użytkownika, definiowanie struktury odpowiedzi (response_format) oraz ustawianie parametrów modeli.

## 2. Opis konstruktora
Konstruktor usługi inicjalizuje kluczowe komponenty:
1. Konfigurację połączenia z API (np. klucz API, endpoint).
2. Parametry modelu, takie jak nazwa modelu i dodatkowe parametry (temperature, max_tokens itp.).
3. Definicję podstawowych komunikatów: system message oraz user message.

Konstruktor zapewnia walidację przekazanych parametrów oraz ustawia domyślne wartości, gwarantując bezpieczne i spójne działanie usługi.

## 3. Publiczne metody i pola
**Metody:**
1. `sendRequest(payload: RequestPayload): Promise<Response>`
   - Wysyła żądanie do API OpenRouter, budując payload zgodnie z zdefiniowanymi regułami.
2. `buildRequestPayload(systemMessage: string, userMessage: string, modelParams: ModelParameters, responseFormat: ResponseFormat): RequestPayload`
   - Tworzy obiekt żądania uwzględniający wszystkie wymagane elementy.
3. `validateResponse(response: any): boolean`
   - Weryfikuje, czy otrzymana odpowiedź spełnia zdefiniowany schemat.

**Pola:**
- `apiKey: string` – Klucz autoryzacyjny do API.
- `endpoint: string` – Adres URL API OpenRouter.
- `defaultModelName: string` – Domyślna nazwa modelu (np. "gpt-4").
- `defaultModelParams: ModelParameters` – Domyślne ustawienia parametrów modelu.

## 4. Prywatne metody i pola
**Metody:**
1. `_formatSystemMessage(message: string): string`
   - Prywatna metoda formatująca komunikat systemowy zgodnie ze standardami serwisu.
2. `_handleApiResponse(apiResponse: any): ParsedResponse`
   - Przetwarza surową odpowiedź API, konwertując ją do ustrukturyzowanego formatu.
3. `_logError(error: Error): void`
   - Zapisuje informacje o błędach do logów, zapewniając szczegółową diagnostykę.

**Pola:**
- `_retryCount: number` – Liczba prób ponowienia wysłania żądania w przypadku błędów.
- `_timeout: number` – Limit czasu oczekiwania na odpowiedź API.

## 5. Obsługa błędów
Usługa uwzględnia następujące scenariusze błędów:
1. **Błąd połączenia z API:**
   - Problem z timeoutem lub brakiem odpowiedzi.
2. **Nieprawidłowa odpowiedź API:**
   - Odbiór danych niezgodnych ze zdefiniowanym schematem response_format.
3. **Błąd autoryzacji:**
   - Nieprawidłowy klucz API lub przekroczenie limitów.
4. **Błąd walidacji danych wejściowych:**
   - Nieprawidłowe parametry komunikatów lub błędna konfiguracja response_format.
5. **Błędy wewnętrzne:**
   - Nieoczekiwane wyjątki wynikające z logiki aplikacji.

Dla każdego scenariusza wdrażane są:
1. Wczesna walidacja i zwracanie odpowiednich błędów.
2. Mechanizm ponawiania żądań z zastosowaniem strategii exponential backoff.
3. Szczegółowe logowanie błędów z zachowaniem danych diagnostycznych.
4. Zabezpieczenie przed ujawnieniem wrażliwych informacji w komunikatach błędów.

## 6. Kwestie bezpieczeństwa
- Bezpieczne przechowywanie kluczy API oraz danych wrażliwych (np. za pomocą zmiennych środowiskowych).
- Walidacja i sanitizacja danych wejściowych przed wysłaniem do API.
- Ograniczenie liczby prób ponawiania połączeń, aby zapobiec potencjalnym atakom.
- Regularne aktualizacje zależności i monitorowanie logów systemowych pod kątem nietypowej aktywności.

## 7. Plan wdrożenia krok po kroku
1. **Przygotowanie środowiska:**
   - Konfiguracja projektu z wykorzystaniem Astro, TypeScript, React oraz Tailwind.
   - Ustawienie zabezpieczeń i konfiguracji dla kluczy API.

2. **Implementacja kluczowych komponentów:**
   - Utworzenie modułu komunikacji z API OpenRouter z uwzględnieniem:
     - Budowy żądania zawierającego:
       1. **System message:** Przykład: "You are a helpful assistant.".
       2. **User message:** Dynamicznie przekazywany na podstawie interakcji użytkownika.
       3. **Response_format:** Przykładowa konfiguracja:
          { type: 'json_schema', json_schema: { name: 'chat_response', strict: true, schema: { message: 'string', timestamp: 'string' } } }.
       4. **Nazwa modelu:** Przykład: "gpt-4".
       5. **Parametry modelu:** Przykład: { temperature: 0.7, max_tokens: 150 }.

3. **Implementacja publicznych i prywatnych metod:**
   - Zaimplementowanie metod budujących payload, wysyłających żądania oraz walidujących odpowiedzi.
   - Dodanie testów jednostkowych dla kluczowych funkcji, takich jak formatowanie komunikatów i parsowanie odpowiedzi.

4. **Implementacja mechanizmu obsługi błędów:**
   - Dodanie wczesnych zwrotów błędów przy nieprawidłowych danych wejściowych.
   - Wdrożenie mechanizmu ponawiania żądań w przypadku timeoutów lub błędów połączenia.
   - Integracja z systemem logowania błędów oraz monitoringu.
