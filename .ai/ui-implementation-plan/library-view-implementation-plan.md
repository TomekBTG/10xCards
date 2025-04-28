# Plan implementacji widoku Biblioteka Fiszek

## 1. Przegląd
Widok Biblioteki Fiszek umożliwia użytkownikowi przeglądanie, filtrowanie, sortowanie oraz zarządzanie wszystkimi zapisanymi fiszkami. Użytkownik może przeglądać podgląd obu stron fiszki, edytować jej treść, zmieniać status (zaakceptowane, odrzucone, w trakcie) oraz wykonywać akcje masowe (bulk actions) jak zmiana statusu lub usunięcie wybranych fiszek.

## 2. Routing widoku
Widok będzie dostępny pod adresami:
- `/library`
- `/flashcards/library`

## 3. Struktura komponentów
Proponowana hierarchia komponentów:
- **LibraryViewPage** (strona główna widoku, umieszczona w katalogu `src/pages` lub `src/pages/flashcards`)
  - **FilterPanel** – panel umożliwiający filtrowanie fiszek (status, kategoria, data utworzenia)
  - **FlashcardList** – komponent renderujący listę fiszek
    - **FlashcardItem** – pojedynczy element listy (podgląd frontu i tyłu, przyciski edycji, checkbox dla bulk actions)
  - **BulkActionsPanel** – panel akcji masowych (zmiana statusu, usuwanie zaznaczonych fiszek)

## 4. Szczegóły komponentów
### LibraryViewPage
- **Opis**: Główny kontener widoku, odpowiedzialny za pobieranie danych z API, zarządzanie stanem oraz koordynację działania podkomponentów.
- **Główne elementy**: Layout strony, logika pobierania danych, przekazywanie stanów do `FilterPanel` i `FlashcardList`.
- **Obsługiwane interakcje**: Ładowanie danych przy inicjalizacji, reagowanie na zmiany filtrów, aktualizacja listy po edycji lub usunięciu fiszki.
- **Warunki walidacji**: Weryfikacja poprawności danych otrzymanych z API; komunikat, gdy lista jest pusta.
- **Typy**: `FlashcardDTO`, `FlashcardsListResponseDTO`.
- **Propsy**: Przekazywanie pobranych danych, callbacki do aktualizacji stanu oraz obsługi zdarzeń z podkomponentów.

### FilterPanel
- **Opis**: Komponent pozwalający na ustawienie kryteriów filtrowania fiszek według statusu, kategorii oraz zakresu dat.
- **Główne elementy**: Elementy UI takie jak dropdowny, pola wyboru dat i przyciski resetujące filtry.
- **Obsługiwane interakcje**: Zmiana kryteriów filtrowania skutkuje aktualizacją widoku; możliwość resetowania filtrów.
- **Warunki walidacji**: Poprawność formatu dat oraz zgodność wybranych wartości statusu (accepted, rejected, pending).
- **Typy**: Nowy typ `FlashcardsFilter`, np.:
  ```typescript
  interface FlashcardsFilter {
    status?: "accepted" | "rejected" | "pending";
    categoryId?: string;
    createdBefore?: Date;
    createdAfter?: Date;
  }
  ```
- **Propsy**: Callback `onFilterChange` przekazujący zmienione kryteria do nadrzędnego komponentu.

### FlashcardList
- **Opis**: Komponent odpowiedzialny za renderowanie listy fiszek w formie siatki lub listy.
- **Główne elementy**: Iteracja po danych, renderowanie pojedynczych komponentów `FlashcardItem`.
- **Obsługiwane interakcje**: Kliknięcia na fiszki (do edycji lub zaznaczenia), zaznaczanie checkboxów dla akcji bulk.
- **Warunki walidacji**: Każda fiszka musi posiadać unikalny identyfikator.
- **Typy**: `FlashcardDTO` oraz rozbudowany typ `FlashcardViewModel` (do obsługi stanu zaznaczenia), np.:
  ```typescript
  interface FlashcardViewModel extends FlashcardDTO {
    selected: boolean;
  }
  ```
- **Propsy**: Lista fiszek, callbacki dla zaznaczenia elementu oraz akcje edycji/usuwania.

### FlashcardItem
- **Opis**: Pojedynczy element listy, prezentujący podgląd fiszki wraz z opcjami edycji i usuwania oraz checkboxem do zaznaczenia.
- **Główne elementy**: Wyświetlanie tekstu frontu i tyłu, przyciski akcji i checkbox.
- **Obsługiwane interakcje**: Kliknięcie przycisku edycji, usuwania, zaznaczenia elementu.
- **Warunki walidacji**: Tekst frontu nie przekracza 200 znaków, tekst tyłu nie przekracza 500 znaków.
- **Typy**: `FlashcardDTO`
- **Propsy**: Obiekt fiszki, callbacki na akcje edycji, usuwania oraz zaznaczania.

### BulkActionsPanel
- **Opis**: Komponent umożliwiający wykonanie akcji masowych na zaznaczonych fiszkach (np. zmiana statusu, usuwanie).
- **Główne elementy**: Przyciski umożliwiające wykonanie wybranej operacji.
- **Obsługiwane interakcje**: Kliknięcia przycisków wywołują akcje na liście zaznaczonych fiszek.
- **Warunki walidacji**: Sprawdzenie, czy przynajmniej jedna fiszka jest zaznaczona przed wykonaniem operacji.
- **Typy**: Lista identyfikatorów fiszek (`string[]`).
- **Propsy**: Lista zaznaczonych elementów oraz callbacki wykonujące operacje zmiany statusu lub usunięcia.

## 5. Typy
- **FlashcardDTO**: Pobrany z `src/types.ts`, reprezentuje strukturę fiszki z bazy danych.
- **FlashcardsListResponseDTO**: Struktura odpowiedzi z API dla listingu fiszek.
- **FlashcardsFilter**: Nowa struktura dla warunków filtrowania, zawierająca opcjonalne pola `status`, `categoryId`, `createdBefore`, `createdAfter`.
- **FlashcardViewModel**: Rozszerzenie `FlashcardDTO` o pole `selected: boolean` do obsługi zaznaczeń w UI.

## 6. Zarządzanie stanem
- Zarządzanie stanem przy użyciu `useState` i/lub `useReducer` w komponencie `LibraryViewPage`.
- Możliwe stworzenie customowego hooka `useFlashcards` do obsługi logiki pobierania danych, filtrowania oraz operacji bulk.
- Główne zmienne stanu:
  - `flashcards: FlashcardViewModel[]` – lista fiszek z dodatkowym stanem zaznaczenia
  - `filters: FlashcardsFilter` – aktualne kryteria filtrowania
  - `selectedFlashcards: string[]` – lista ID zaznaczonych fiszek
  - `isLoading: boolean` – stan ładowania danych
  - `error: string | null` – komunikat błędu

## 7. Integracja API
- Pobieranie listy fiszek za pomocą endpointu `GET /api/flashcards` z parametrami zapytania (page, limit, status itp.).
  - Typ żądania: parametry do filtrowania i paginacja
  - Typ odpowiedzi: `FlashcardsListResponseDTO`
- Aktualizacja pojedynczej fiszki przez endpoint `PUT/PATCH /api/flashcards/{id}`.
- Dla akcji bulk wykonywać iteracyjne lub równoległe wywołania API do zmiany statusu lub usuwania fiszek.
- Walidacja odpowiedzi API oraz obsługa błędów (401, 404, 400) – przekazywanie informacji do stanu komponentu.

## 8. Interakcje użytkownika
- **Filtrowanie**: Użytkownik wybiera kryteria w `FilterPanel`, co powoduje aktualizację widoku i ponowne pobranie danych.
- **Edycja**: Kliknięcie przycisku edycji w `FlashcardItem` otwiera modal lub przechodzi do trybu edycji,
  umożliwiając zmianę treści fiszki.
- **Zaznaczanie**: Checkbox w `FlashcardItem` pozwala na zaznaczenie fiszki dla operacji bulk.
- **Bulk actions**: Po zaznaczeniu, użytkownik może zmienić status lub usunąć kilka fiszek jednocześnie przez `BulkActionsPanel`.
- **Paginacja**: Użytkownik zmienia stronę listy, co powoduje kolejne wywołanie API z nowymi parametrami stronicowania.

## 9. Warunki i walidacja
- Walidacja pól edycji: front (max 200 znaków) oraz back (max 500 znaków), sprawdzenie poprawności formatu danych wejściowych.
- Weryfikacja poprawności filtrów (format dat, zgodność wartości statusu) w `FilterPanel`.
- Przed wykonaniem akcji bulk sprawdzenie, czy przynajmniej jedna fiszka została zaznaczona.
- Weryfikacja odpowiedzi API i wyświetlanie komunikatów błędów w UI.

## 10. Obsługa błędów
- Wyświetlanie komunikatów błędów przy niepowodzeniu wywołań API (np. nieautoryzowany dostęp, błąd walidacji).
- Obsługa błędów sieciowych z możliwością ponowienia próby pobrania danych.
- Komunikat o braku fiszek, gdy lista jest pusta.
- Natychmiastowa walidacja i odpowiedź na błędy przy edycji fiszki (przekroczenie limitu znaków itd.).

## 11. Kroki implementacji
1. Utworzenie pliku strony widoku w `src/pages/library.astro` lub `src/pages/flashcards/library.astro`.
2. Implementacja głównego kontenera `LibraryViewPage` z logiką pobierania danych z API oraz zarządzania stanem (filtry, zaznaczenia, paginacja).
3. Stworzenie komponentu `FilterPanel` z elementami UI umożliwiającymi wybór kryteriów filtrowania i przekazywanie zmian do `LibraryViewPage`.
4. Implementacja komponentu `FlashcardList` oraz elementów `FlashcardItem` do wyświetlania poszczególnych fiszek, wraz z obsługą zaznaczania i akcji edycji.
5. Dodanie komponentu `BulkActionsPanel` do wykonywania masowych operacji na zaznaczonych fiszkach (zmiana statusu, usuwanie).
6. Integracja z endpointami API: pobieranie listy fiszek (`GET /api/flashcards`), aktualizacja (`PUT/PATCH /api/flashcards/{id}`) i usuwanie fiszek (ewentualny `DELETE /api/flashcards/{id}`).
7. Stworzenie customowego hooka (np. `useFlashcards`) do zarządzania logiką pobierania, filtrowania, zaznaczania oraz obsługi akcji bulk.
8. Dodanie walidacji danych wejściowych zarówno w komponentach edycyjnych, jak i w panelu filtrów, wraz z obsługą komunikatów błędów.
9. Testowanie działania widoku w scenariuszach: poprawne pobranie danych, brak danych, błędy API, akcje bulk oraz walidacja formularzy.
10. Przegląd kodu, refaktoryzacja oraz dokumentacja zmian zgodnie z wytycznymi projektowymi. 