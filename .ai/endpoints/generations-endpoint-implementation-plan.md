# API Endpoint Implementation Plan: Generate Flashcards with AI

## 1. Przegląd punktu końcowego
Endpoint umożliwia generowanie fiszek przy użyciu usługi AI na podstawie tekstu dostarczonego przez użytkownika. System generuje od 5 do 15 fiszek, ustawia flagę `is_ai_generated` na true i status na "pending", a następnie zapisuje log generacji w tabeli `flashcard_generation_logs`.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Struktura URL:** /api/flashcards/ai
- **Parametry:**
  - **Wymagane:**
    - `user_input`: Tekst wejściowy (string) zawierający przynajmniej 500 znaków i maksymalnie 10000 znaków, musi zawierać istotną treść.
  - **Opcjonalne:** Brak
- **Request Body:**
```json
{
  "user_input": "Tekst wejściowy do generacji fiszek"
}
```

## 3. Wykorzystywane typy
- **Żądanie:** `GenerateFlashcardsCommand` (zdefiniowany w `src/types.ts`)
- **Odpowiedź:** `GenerateFlashcardsResponseDTO`, zawierający:
  - `flashcards`: Tablica obiektów typu `FlashcardDTO`
  - `log`: Obiekt typu `FlashcardGenerationLogDTO`

## 4. Szczegóły odpowiedzi
- **Sukces:**
  - Kod statusu: 201 (Created)
  - Odpowiedź JSON zawierająca wygenerowane fiszki i log generacji.
- **Błędy:**
  - 400: Nieprawidłowe dane wejściowe (np. zbyt krótki lub zbyt długi tekst, brak istotnej treści)
  - 401: Brak autoryzacji
  - 500: Błąd po stronie serwera (np. niepowodzenie generacji przez usługę AI)

## 5. Przepływ danych
1. Odbiór żądania przez endpoint i wstępna walidacja danych wejściowych (np. przy użyciu Zod).
2. Weryfikacja autoryzacji użytkownika (np. poprzez middleware Supabase).
3. Wywołanie usługi AI do generacji fiszek na podstawie `user_input`.
4. Ograniczenie długości pól:
   - `front`: maksymalnie 200 znaków
   - `back`: maksymalnie 500 znaków
5. Utworzenie wpisów w tabeli `flashcards` z flagą `is_ai_generated` ustawioną na true oraz statusem "pending".
6. Utworzenie wpisu w tabeli `flashcard_generation_logs`, rejestrującego czas generacji, liczbę wygenerowanych fiszek, a także liczbę akceptowanych i odrzuconych.
7. Wysłanie odpowiedzi do klienta z wygenerowanymi danymi.

## 6. Względy bezpieczeństwa
- **Autoryzacja:** Endpoint dostępny wyłącznie dla zalogowanych użytkowników; weryfikacja tokena JWT przy użyciu Supabase.
- **Walidacja danych:** Użycie Zod do walidacji `user_input` w zakresie 500-10000 znaków oraz jego zawartości.
- **Ochrona przed SQL Injection:** Wykorzystanie przygotowanych zapytań przy użyciu SDK Supabase.
- **RLS (Row-Level Security):** Zastosowanie polityk RLS dla tabel `flashcards` i `flashcard_generation_logs`, by upewnić się, że użytkownicy mają dostęp tylko do swoich danych.

## 7. Obsługa błędów
- **400 Bad Request:** Zwrócone, gdy dane wejściowe nie spełniają wymagań walidacji (np. tekst jest zbyt krótki lub nie zawiera istotnej treści).
- **401 Unauthorized:** Zwrócone, gdy użytkownik nie jest zalogowany lub brak poprawnego tokena autoryzacyjnego.
- **500 Internal Server Error:** Zwrócone w przypadku niepowodzenia operacji generacji AI lub błędów bazy danych. Wszystkie błędy powinny być logowane w systemie monitoringu.

## 8. Rozważania dotyczące wydajności
- **Ograniczenie wejścia:** Maksymalny rozmiar tekstu ogranicza obciążenie systemu.
- **Asynchroniczność:** Wywołania usługi AI powinny być wykonywane asynchronicznie, co umożliwi efektywne zarządzanie zasobami.
- **Optymalizacja bazy danych:** Użycie indeksów (np. na `user_id`) oraz batch insert przy zapisie wielu fiszek jednocześnie.

## 9. Etapy wdrożenia
1. Utworzenie pliku endpointu pod adresem `src/pages/api/flashcards/ai.ts`.
2. Implementacja walidacji danych wejściowych przy użyciu Zod.
3. Dodanie mechanizmu autoryzacji (middleware Supabase) w celu weryfikacji użytkownika.
4. Integracja z usługą AI do generacji fiszek.
5. Implementacja logiki ograniczania długości pól (`front` i `back`) oraz ustawienia flagi `is_ai_generated` i statusu "pending".
6. Zapis danych w tabelach `flashcards` oraz `flashcard_generation_logs` przy użyciu SDK Supabase.
7. Implementacja kompleksowej obsługi błędów wraz z logowaniem.
8. Przegląd kodu przez zespół oraz wdrożenie na środowisko testowe. 