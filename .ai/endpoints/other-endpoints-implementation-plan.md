# API Endpoint Implementation Plan: Flashcards API

## 1. Przegląd punktu końcowego
Endpointy API dla flashcards mają na celu umożliwienie operacji CRUD (Create, Read, Update, Delete) na fiszkach oraz obsługę logów generacji AI. Użytkownik uwierzytelniony może pobierać, tworzyć, aktualizować i usuwać fiszki, a także przeglądać logi generacji AI.

## 2. Szczegóły żądania
- **Metody HTTP i ścieżki URL:**
  - **GET /api/flashcards**
    - Pobiera listę fiszek z paginacją.
    - Parametry zapytania (opcjonalne): page, limit, status (accepted, rejected, pending), sort (np. created_at desc).
  - **POST /api/flashcards**
    - Tworzy jedną lub więcej fiszek.
    - Request Body: JSON z polem "flashcards" zawierającym tablicę obiektów. Każdy obiekt zawiera: front (max 200 znaków), back (max 500 znaków) oraz is_ai_generated (boolean).
  - **GET /api/flashcards/{id}**
    - Pobiera pojedynczą fiszkę po identyfikatorze.
  - **GET /api/flashcards/generation/{generationId}**
    - Pobiera wszystkie fiszki powiązane z określonym identyfikatorem generacji wraz z logiem generacji.
  - **PUT/PATCH /api/flashcards/{id}**
    - Aktualizuje istniejącą fiszkę. W body przekazuje się front, back oraz status (accepted, rejected, pending).
  - **DELETE /api/flashcards/{id}**
    - Usuwa fiszkę.
  - **GET /api/flashcards/logs**
    - Pobiera listę logów generacji AI z paginacją.

- **Parametry:**
  - Wymagane:
    - Uwierzytelnienie (401 Unauthorized w przypadku braku dostępu).
  - Opcjonalne (dla GET /api/flashcards i GET /api/flashcards/logs):
    - page, limit, status, sort.

## 3. Wykorzystywane typy
- **DTOs i Command Modele (zdefiniowane w src/types.ts):**
  - `FlashcardDTO`
  - `FlashcardGenerationLogDTO`
  - `CreateFlashcardCommand` oraz `CreateFlashcardsCommand`
  - `UpdateFlashcardCommand`
  - `GenerateFlashcardsCommand` (dla AI, jeśli rozszerzamy funkcjonalność generacji)
  - `GenerateFlashcardsResponseDTO`

## 4. Szczegóły odpowiedzi
- **GET /api/flashcards:**
  - Response: JSON zawierający { data: FlashcardDTO[], pagination: { page, limit, total } } oraz kod 200.
- **POST /api/flashcards:**
  - Response: JSON zawierający { data: FlashcardDTO[], failed: [{ index, error }] } przy kodzie 201.
- **GET /api/flashcards/{id}:**
  - Response: Obiekt FlashcardDTO, kod 200.
- **GET /api/flashcards/generation/{generationId}:**
  - Response: JSON zawierający { data: FlashcardDTO[], generation: FlashcardGenerationLogDTO }, kod 200.
- **PUT/PATCH /api/flashcards/{id}:**
  - Response: Zaktualizowany obiekt FlashcardDTO, kod 200.
- **DELETE /api/flashcards/{id}:**
  - Response: Komunikat potwierdzający operację, kod 200.
- **GET /api/flashcards/logs:**
  - Response: JSON zawierający { data: FlashcardGenerationLogDTO[], pagination: { page, limit, total } }, kod 200.

## 5. Przepływ danych
1. Użytkownik wysyła żądanie z odpowiednimi parametrami i (dla POST/PUT) danymi w ciele żądania.
2. Warstwa middleware sprawdza uwierzytelnienie (używając np. kontekstu Supabase).
3. Walidacja danych wejściowych przy pomocy Zod schematów.
4. Logika biznesowa jest wydzielona w warstwie service (np. src/lib/services/flashcardsService.ts), która komunikuje się z bazą danych Supabase.
5. Wykonywane są odpowiednie operacje na bazie danych (pobranie, zapis, aktualizacja lub usunięcie).
6. W przypadku operacji POST przetwarzane są także błędy walidacji poszczególnych fiszek, które są rejestrowane w tablicy "failed".
7. Odpowiedź jest budowana i zwracana do klienta.

## 6. Względy bezpieczeństwa
- Każde żądanie musi być autoryzowane. W przypadku braku autoryzacji, zwracany jest status 401.
- Walidacja danych wejściowych zapobiega próbą wysłania nieprawidłowych lub złośliwych danych.
- Użycie parametrów zapytań i właściwych indeksów bazy danych (np. idx_flashcards_user_id) dla optymalizacji zapytań.
- Obsługa RLS (Row-Level Security) po stronie Supabase, aby zapewnić, że użytkownik operuje tylko na swoich zasobach.

## 7. Obsługa błędów
- **400 Bad Request:** Nieprawidłowe dane wejściowe (np. przekroczenie maksymalnej długości pól).
- **401 Unauthorized:** Brak autoryzacji lub niewłaściwy token.
- **404 Not Found:** Zasób (fiszka, log generacji) nie został znaleziony.
- **500 Internal Server Error:** Błąd po stronie serwera, niezależnie od operacji.
- Logowanie błędów przy użyciu odpowiednich mechanizmów (np. console.error lub zewnętrznego systemu logowania) w warstwie serwisowej.

## 8. Rozważania dotyczące wydajności
- Użycie paginacji ogranicza liczbę pobieranych rekordów.
- Indeksy w bazie danych poprawiają szybkość zapytań.
- Asynchroniczne operacje oraz ewentualne cache'owanie wyników zapytań, jeśli to konieczne.
- Minimalizacja liczby zapytań do bazy danych poprzez wydajne przetwarzanie filtrów i sortowania.

## 9. Etapy wdrożenia
1. **Planowanie i przygotowanie:**
   - Zdefiniowanie schematów walidacyjnych przy użyciu Zod.
   - Określenie struktury endpointów w katalogu `./src/pages/api/flashcards`.
2. **Implementacja logiki biznesowej:**
   - Utworzenie lub modyfikacja serwisu w `./src/lib/services/flashcardsService.ts` do obsługi operacji na fiszkach.
   - Implementacja funkcji odpowiedzialnych za paginację, filtrowanie, sortowanie oraz walidację danych.
3. **Implementacja endpointów API:**
   - Utworzenie plików dla endpointów: GET, POST, GET/{id}, GET /generation/{generationId}, PUT/PATCH, DELETE oraz GET /logs.
   - Dodanie autoryzacji i middleware w każdym endpointie.
4. **Testowanie i walidacja:**
   - Pisanie testów jednostkowych oraz integracyjnych dla poszczególnych endpointów.
   - Przeprowadzenie testów ręcznych i automatycznych, aby upewnić się, że walidacja oraz logika biznesowa działają poprawnie.
5. **Dokumentacja i review:**
   - Sporządzenie dokumentacji API, uwzględniającej opis endpointów, typy danych wejściowych/wyjściowych oraz kody stanu.
   - Peer review kodu i wprowadzenie poprawek zgodnie z feedbackiem.
6. **Deployment:**
   - Wdrożenie endpointów na środowisku testowym, a następnie produkcyjnym.
   - Monitorowanie działania API oraz szybka reakcja na zgłoszenia błędów.

---

Plan wdrożenia zapewnia pełny cykl implementacji endpointów, z naciskiem na bezpieczeństwo, walidację danych, obsługę błędów oraz optymalizację wydajności. 