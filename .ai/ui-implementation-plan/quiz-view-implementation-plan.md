# Plan implementacji widoku Quiz

## 1. Przegląd
Widok sesji powtórkowej (Quiz) pozwala użytkownikowi przeprowadzić interaktywną sesję utrwalania wiedzy za pomocą wcześniej utworzonych fiszek. Aplikacja losowo wybiera zestaw fiszek, wyświetla pytania (przód karty), umożliwia odsłonięcie odpowiedzi (tył karty), a użytkownik oznacza odpowiedź jako poprawną lub niepoprawną. Po zakończeniu quizu wyświetlane są statystyki: liczba poprawnych, liczba niepoprawnych odpowiedzi, procent poprawnych oraz łączny czas sesji.

## 2. Routing widoku
Ścieżka: `/quiz`

Umieścić stronę React w `src/pages/quiz.astro`, ładowaną w trybie klienta (client:load).

## 3. Struktura komponentów
```
src/pages/quiz.astro
└── QuizApp (React, client:load)
    └── QuizProvider (context zarządzania stanem)
        ├── QuizCard (wyświetlanie przodu i tylu fiszki)
        ├── QuizTimer (timer sesji)
        ├── QuizNavigation (przyciski: odsłoń, poprawna, niepoprawna)
        └── QuizSummary (podsumowanie wyników)
```

## 4. Szczegóły komponentów

### 4.1 QuizApp
- Opis: Główny komponent inicjujący hooki, kontekst i wywołanie API.
- Główne elementy: kontener React, hook `useQuizManager`, provider kontekstu.
- Obsługiwane zdarzenia: inicjalizacja quizu po montażu.
- Typy: `FlashcardDTO[]` (pobrane dane), `QuizFlashcardVM[]` (wewnętrzna reprezentacja).
- Propsy: brak.

### 4.2 QuizProvider
- Opis: Dostarcza stan quizu (lista, indeks, statystyki, czas) za pomocą Context API.
- Główne elementy: Context, Reducer lub hook `useReducer`.
- Obsługiwane zdarzenia: `NEXT_CARD`, `REVEAL_ANSWER`, `MARK_ANSWER`.
- Typy: `QuizState`, `QuizAction`.
- Propsy: `children`.

### 4.3 QuizCard
- Opis: Wyświetla pytanie (front), a po odsłonięciu tył karty.
- Główne elementy: `<div>` z tekstem przodu, tyłu (ukryty do reveal).
- Obsługiwane zdarzenia: kliknięcie przycisku "Odsłoń odpowiedź".
- Typy: `QuizFlashcardVM` (pole front/back i revealed:boolean).
- Propsy: `{ card: QuizFlashcardVM }`.

### 4.4 QuizTimer
- Opis: Odmierza czas trwania sesji od startu do zakończenia.
- Główne elementy: `<span>` wyświetlające czas.
- Obsługiwane zdarzenia: start, stop, reset.
- Typy: `useTimer` hook zwracający `{ seconds: number, start: ()=>void, stop: ()=>void }`.
- Propsy: brak (korzysta z kontekstu).

### 4.5 QuizNavigation
- Opis: Przyciski akcji: odsłoń odpowiedź, oznacz poprawną, oznacz niepoprawną.
- Główne elementy: trzy `<button>` lub komponenty z shadcn/ui.
- Obsługiwane zdarzenia: `onReveal`, `onMarkCorrect`, `onMarkIncorrect`.
- Typy: funkcje callback.
- Propsy: `{ onReveal: ()=>void; onMark: (correct: boolean)=>void; disabledReveal: boolean; disabledMark: boolean; }`.

### 4.6 QuizSummary
- Opis: Podsumowanie wyników sesji po zakończeniu wszystkich kart.
- Główne elementy: liczba poprawnych, niepoprawnych, procent, czas.
- Obsługiwane zdarzenia: przycisk "Rozpocznij ponownie" lub "Powrót do pulpitu".
- Typy: `QuizStatsVM`.
- Propsy: `{ stats: QuizStatsVM; onRestart: ()=>void }`.

## 5. Typy

- `FlashcardDTO` – istniejący typ z `src/types.ts`.
- `QuizFlashcardVM`:
  ```ts
  interface QuizFlashcardVM {
    id: string;
    front: string;
    back: string;
    revealed: boolean;
    userAnswer?: "correct" | "incorrect";
  }
  ```
- `QuizStatsVM`:
  ```ts
  interface QuizStatsVM {
    total: number;
    correctCount: number;
    incorrectCount: number;
    percentCorrect: number;
    durationSeconds: number;
  }
  ```
- `QuizState`, `QuizAction` – dla `useReducer` lub context.

## 6. Zarządzanie stanem

- `useQuizManager` lub Context+Reducer zapewnia:
  - Początkowe pobranie i wymieszanie kart.
  - `currentIndex`, `cards`, `stats`, `timer`.
  - Funkcje: `revealAnswer()`, `markAnswer(correct: boolean)`, `nextCard()`, `restartQuiz()`.
- `useTimer` dbający o odmierzenie czasu.

## 7. Integracja API

- Endpoint: `GET /api/flashcards` (autoryzowany, zwraca `FlashcardDTO[]`).
- Akcja frontendowa: fetch w `useEffect`, ustawienie kart i shuffle.
- Nagłówki: Authorization: Bearer JWT (automatycznie przez Supabase client).
- Obsługa błędów: 401 → przekierowanie do logowania; inne → komunikat.

## 8. Interakcje użytkownika

1. Wejście na `/quiz` → ładowanie danych → wyświetlenie pierwszej karty.
2. Kliknięcie "Odsłoń odpowiedź" → wyświetlenie tylu karty.
3. Kliknięcie "Poprawna" lub "Niepoprawna" → zapis odpowiedzi, aktualizacja statystyk, automatyczne przejście do kolejnej karty.
4. Po ostatniej karcie → wywołanie `QuizSummary` z wynikami.
5. W `QuizSummary` możliwość restartu lub powrotu.

## 9. Warunki i walidacja

- Sprawdzenie, czy liczba kart > 0; jeśli brak → komunikat "Brak fiszek do powtórki".
- Przyciski "Poprawna"/"Niepoprawna" aktywne dopiero po odsłonięciu odpowiedzi.
- Ograniczenie czasu sesji: opcjonalne – wyświetlać timer, ale nie blokować akcji.

## 10. Obsługa błędów

- Brak kart: komunikat i link do tworzenia fiszek.
- Błąd pobierania: alert z przyciskiem "Spróbuj ponownie".
- 401 Unauthorized: przekierowanie do `/login`.

## 11. Kroki implementacji
1. Utworzyć `src/pages/quiz.astro` z importem i `client:load` React.
2. Stworzyć folder `src/components/quiz` i komponenty: `QuizApp.tsx`, `QuizCard.tsx`, `QuizTimer.tsx`, `QuizNavigation.tsx`, `QuizSummary.tsx`.
3. Zaimplementować typy w `src/types.ts` lub nowym module `quizTypes.ts`.
4. Napisać hook `useQuizManager` i `useTimer` w `src/lib/hooks`.
5. Dodać logikę fetchowania flashcards i shuffle w `QuizApp`.
6. Stworzyć kontekst `QuizContext` (opcjonalnie) lub użyć hooka w `QuizApp`.
7. Zaimplementować UI komponentów korzystając z Shadcn/ui i Tailwind.
8. Obsłużyć scenariusze błędów i brak danych.
9. Dodać testy jednostkowe dla hooków i kluczowych komponentów.
10. Sprawdzić responsywność i UX na różnych urządzeniach. 