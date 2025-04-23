# Plan implementacji widoku Generowanie Fiszek

## 1. Przegląd
Widok umożliwia użytkownikowi wprowadzenie długiego tekstu (500–10000 znaków) i generowanie fiszek za pomocą AI. Po przesłaniu tekstu, aplikacja wywołuje odpowiedni endpoint i prezentuje wyniki w formie interfejsu recenzji fiszek, gdzie użytkownik może akceptować, edytować lub odrzucać wygenerowane fiszki. BARDZO WAŻNE - całość korzysta z responsywnego optartego na Tailwind, gotowych komponentów z Shadcn/ui oraz React.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/generate`.

## 3. Struktura komponentów
```
/generate.astro (strona widoku)
└── <GenerateFlashcardsView> (komponent React)
     ├── <GenerateFlashcardsForm> - formularz do wprowadzania tekstu
     └── <FlashcardsReview> - komponent wyświetlający wygenerowane fiszki wraz z interfejsem recenzji
          └── <FlashcardCard> - pojedycza fiszka z przyciskami: Akceptuj, Edytuj, Odrzuć
```

## 4. Szczegóły komponentów
### GenerateFlashcardsForm
- **Opis:** Formularz umożliwiający wprowadzenie tekstu i wywołanie procesu generowania fiszek.
- **Główne elementy:**
  - Pole textarea do wprowadzania tekstu
  - Przycisk "Wygeneruj" inicjujący wywołanie API
  - Spinner ładowania podczas przetwarzania
  - Komunikaty walidacyjne (np. informujące o nieodpowiedniej długości tekstu)
- **Obsługiwane interakcje:**
  - Zmiana zawartości textarea
  - Kliknięcie przycisku wysyłającego formularz
- **Warunki walidacji:**
  - Tekst musi mieć minimum 500 znaków
  - Tekst nie może przekraczać 10000 znaków
- **Typy:** Wykorzystanie `GenerateFlashcardsCommand` dla wejścia oraz `GenerateFlashcardsResponseDTO` dla odpowiedzi API.
- **Propsy:** Funkcja callback (np. onGenerated) przekazująca wynikowe fiszki i log generacji.

### FlashcardsReview
- **Opis:** Komponent prezentujący wygenerowane fiszki i umożliwiający recenzję ich treści.
- **Główne elementy:**
  - Lista fiszek
  - Dla każdej fiszki komponent <FlashcardCard>
- **Obsługiwane interakcje:**
  - Kliknięcia przycisków: Akceptuj, Edytuj, Odrzuć, modyfikujące status fiszki
- **Warunki walidacji:**
  - Akcje wywołujące aktualizację statusu muszą być zgodne z walidacją API
- **Typy:** Wykorzystanie `FlashcardDTO` oraz `FlashcardGenerationLogDTO`.
- **Propsy:** Lista fiszek oraz funkcje do zmiany statusu.

### FlashcardCard
- **Opis:** Pojedynczy element wyświetlający treść fiszki.
- **Główne elementy:**
  - Wyświetlanie treści przedniej i tylnej fiszki
  - Przycisk "Akceptuj"
  - Przycisk "Edytuj"
  - Przycisk "Odrzuć"
- **Obsługiwane interakcje:**
  - Kliknięcie przycisków wywołujące odpowiednie akcje aktualizacyjne poprzez API
- **Typy:** Opiera się na typie `FlashcardDTO`.

## 5. Typy
- **GenerateFlashcardsCommand:**
  - Pola:
    - `user_input: string` – tekst wprowadzany przez użytkownika.
- **GenerateFlashcardsResponseDTO:**
  - Pola:
    - `flashcards: FlashcardDTO[]`
    - `log: FlashcardGenerationLogDTO`
- **GenerateFlashcardsViewModel (custom):**
  - `inputText: string`
  - `error: string | null`
  - `loading: boolean`
  - `flashcards: FlashcardDTO[]`
  - `generationLog: FlashcardGenerationLogDTO | null`

## 6. Zarządzanie stanem
- Użycie hooków `useState` i `useEffect` w komponencie <GenerateFlashcardsView>.
- Implementacja custom hooka, np. `useGenerateFlashcards`, do obsługi wywołania API POST `/api/flashcards/ai`.
- Przechowywanie w stanie: tekstu wejściowego, komunikatów walidacyjnych, stanu ładowania, wynikowych fiszek oraz logu generacji.

## 7. Integracja API
- **Wywołanie:** POST do endpointu `/api/flashcards/ai` z ładunkiem `{ user_input: string }`.
- **Odpowiedź:** Obiekt typu `GenerateFlashcardsResponseDTO` zawierający wygenerowane fiszki oraz log generacji.
- **Obsługa:** W przypadku sukcesu aktualizacja stanu widoku, a w przypadku błędu - wyświetlenie komunikatu o błędzie.

## 8. Interakcje użytkownika
- Użytkownik wpisuje tekst w polu textarea.
- Interfejs pokazuje komunikaty walidacyjne, jeśli tekst nie spełnia kryteriów (mniej niż 500 znaków lub więcej niż 10000 znaków).
- Po kliknięciu przycisku "Wygeneruj" wyświetlany jest spinner, a formularz zostaje zablokowany podczas przetwarzania.
- Po otrzymaniu odpowiedzi, użytkownik widzi listę wygenerowanych fiszek z przyciskami do recenzji (Akceptuj, Edytuj, Odrzuć).

## 9. Warunki i walidacja
- **Na poziomie formularza:**
  - Walidacja długości tekstu (min. 500, max. 10000 znaków) przed wysłaniem żądania.
- **Przy wywołaniu API:**
  - Backend dodatkowo weryfikuje dane wejściowe i ograniczenia długości pól fiszek.

## 10. Obsługa błędów
- Wyświetlanie komunikatów o błędach walidacyjnych, gdy tekst nie spełnia kryteriów.
- Obsługa błędów HTTP (np. 400 lub 500) z odpowiednim komunikatem na interfejsie.
- Ukrycie spinnera ładowania i umożliwienie ponownej próby w razie niepowodzenia.

## 11. Kroki implementacji
1. Utworzyć nową stronę `/generate.astro` w katalogu `src/pages`.
2. Stworzyć komponent React `<GenerateFlashcardsView>` w katalogu `src/components` lub `src/components/views`.
3. Zaimplementować `<GenerateFlashcardsForm>`:
   - Dodanie pola textarea z walidacją długości.
   - Dodanie przycisku "Wygeneruj" i mechanizmu wywołania API.
   - Implementacja spinnera ładowania oraz komunikatów błędów.
4. Utworzyć komponent `<FlashcardsReview>` do prezentacji wyników generowania:
   - Renderowanie listy fiszek przy użyciu komponentu `<FlashcardCard>`.
   - Dodanie przycisków akcji (Akceptuj, Edytuj, Odrzuć) i integracja z API dla aktualizacji statusów.
5. Zaimplementować zarządzanie stanem w widoku oraz stworzyć custom hook (np. `useGenerateFlashcards`) do obsługi logiki wywołań API.
6. Przetestować integrację z endpointem POST `/api/flashcards/ai` oraz walidację na frontendzie.
7. Zaimplementować obsługę błędów oraz logowanie problemów w interfejsie.
8. Dostosować UI do wytycznych Tailwind i Shadcn/ui. 