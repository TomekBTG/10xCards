# Integracja z OpenRouter

Ten dokument opisuje integrację z serwisem OpenRouter, który umożliwia wzbogacenie aplikacji o funkcje bazujące na zaawansowanych modelach językowych (LLM).

## Konfiguracja serwisu

### Zmienne środowiskowe

Aby skonfigurować integrację z OpenRouter, dodaj następującą zmienną środowiskową do pliku `.env`:

```
PUBLIC_OPENROUTER_API_KEY=your-openrouter-api-key
```

Możesz uzyskać klucz API rejestrując się na [OpenRouter](https://openrouter.ai/).

### Modele

Serwis OpenRouter umożliwia dostęp do różnych modeli AI. W aplikacji zdefiniowano następujące modele:

- GPT-4
- GPT-3.5 Turbo
- Claude 3 Opus
- Claude 3 Sonnet
- Claude 3 Haiku
- Mistral Large

Domyślnie aplikacja używa modelu Claude 3 Haiku, który oferuje dobry stosunek ceny do jakości. Możesz zmienić model domyślny edytując plik `src/lib/services/openrouter.config.ts`.

## Funkcjonalności

Integracja z OpenRouter umożliwia następujące funkcjonalności:

### 1. Generowanie fiszek

Serwis AI może automatycznie generować fiszki na podstawie podanego tekstu. Dla każdej fiszki generowane jest:
- Pytanie (front)
- Odpowiedź (back)
- Poziom trudności (easy/medium/hard)

Przykład użycia:

```typescript
import { aiService } from './lib/services/ai.service';

// Generowanie wielu fiszek
const flashcards = await aiService.generateFlashcards(
  'Tekst do analizy...',
  'category-id',  // opcjonalne
  'Nazwa kategorii'  // opcjonalne
);

// Generowanie pojedynczej fiszki
const flashcard = await aiService.generateSingleFlashcard('Tekst do analizy...');
```

### 2. Przeformułowanie tekstu

Serwis może pomóc w przeformułowaniu tekstu bez zmiany jego znaczenia:

```typescript
import { aiService } from './lib/services/ai.service';

const oryginalnyTekst = 'Tekst do przeformułowania...';
const przeformulowanyTekst = await aiService.rephrase(oryginalnyTekst);
```

## Obsługa błędów

Serwis został zaprojektowany z myślą o odporności na błędy:

1. Jeśli klucz API nie jest dostępny, funkcje gracefully degradują do metod zastępczych (mock)
2. W przypadku błędów API, implementacja zawiera mechanizm ponownych prób z wykładniczym opóźnieniem (exponential backoff)
3. Wszystkie błędy są odpowiednio logowane i nie powodują awarii aplikacji

## Przykłady

W pliku `src/lib/services/openrouter.examples.ts` znajdują się przykłady użycia serwisu:

1. Podstawowe użycie
2. Użycie z niestandardowymi parametrami modelu
3. Użycie ze strukturyzowaną odpowiedzią (JSON Schema)
4. Generowanie fiszek

## Rozszerzenie

Aby dodać nowe funkcjonalności bazujące na AI:

1. Zdefiniuj odpowiedni format JSON dla odpowiedzi w `ResponseFormat`
2. Stwórz system message z precyzyjnymi instrukcjami dla modelu
3. Dodaj nową metodę w `aiService`
4. Połącz z interfejsem użytkownika

## Testowanie

Testy dla serwisu OpenRouter znajdują się w `src/lib/services/__tests__/openrouter.service.test.ts`. 
Przed uruchomieniem testów należy zainstalować zależności testowe:

```bash
npm i --save-dev @types/jest
``` 