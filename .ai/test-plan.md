# Plan Testów dla Projektu 10xCards

## 1. Wprowadzenie i cele testowania

### 1.1 Cel dokumentu
Niniejszy plan testów definiuje strategię, zakres, podejście, zasoby i harmonogram działań testowych dla aplikacji 10xCards. Dokument służy jako główny przewodnik dla zespołu testowego i interesariuszy projektu.

### 1.2 Cele procesu testowego
- Weryfikacja poprawności działania wszystkich funkcjonalności aplikacji zgodnie z wymaganiami
- Zapewnienie wysokiej jakości doświadczenia użytkownika
- Identyfikacja i eliminacja błędów przed wdrożeniem produkcyjnym
- Potwierdzenie zgodności z najlepszymi praktykami w zakresie dostępności i wydajności
- Weryfikacja integracji z zewnętrznymi usługami (Supabase, OpenRouter.ai)

## 2. Zakres testów

### 2.1 Funkcjonalności podlegające testowaniu
1. **Zarządzanie fiszkami**
   - Tworzenie, edycja i usuwanie fiszek
   - Kategoryzacja fiszek
   - Określanie poziomów trudności

2. **Generowanie fiszek przy użyciu AI**
   - Generowanie fiszek na podstawie wprowadzonego tekstu
   - Zapis historii generacji
   - Zarządzanie limitami generacji

3. **Quiz i nauka**
   - Rozwiązywanie quizów na podstawie fiszek
   - Filtrowanie pytań według kategorii i trudności
   - Przegląd wyników i statystyk

4. **Zarządzanie kontem**
   - Rejestracja, logowanie i wylogowanie
   - Zmiana hasła i resetowanie hasła
   - Edycja profilu
   - Usuwanie konta

5. **Panel główny i biblioteka fiszek**
   - Wyświetlanie statystyk i postępów
   - Przeglądanie biblioteki fiszek z filtrowaniem

### 2.2 Elementy wyłączone z zakresu testów
- Testy infrastruktury hostingowej DigitalOcean
- Testy wewnętrznej implementacji Supabase
- Testy wewnętrznych algorytmów modeli AI

## 3. Typy testów

### 3.1 Testy jednostkowe
- **Zakres**: Komponenty React, funkcje pomocnicze, hooki
- **Narzędzia**: Vitest/Jest, React Testing Library
- **Priorytet**: Wysoki
- **Podejście**: Testy izolowanych komponentów z mockowaniem zależności
- **Pokrycie kodu**: Minimum 70% dla kluczowych funkcjonalności

### 3.2 Testy integracyjne
- **Zakres**: Integracja między komponentami, przepływ danych, integracja z Supabase
- **Narzędzia**: Vitest/Jest, MSW (Mock Service Worker), Supabase-js-mocks
- **Priorytet**: Wysoki
- **Podejście**: Weryfikacja poprawnej komunikacji między modułami

### 3.3 Testy E2E
- **Zakres**: Pełne ścieżki użytkownika, przepływy biznesowe
- **Narzędzia**: Playwright/Cypress
- **Priorytet**: Wysoki
- **Podejście**: Automatyzacja głównych przypadków użycia

### 3.4 Testy komponentów
- **Zakres**: Komponenty UI (shadcn/ui, komponenty niestandardowe)
- **Narzędzia**: Storybook, Vitest/Jest, React Testing Library
- **Priorytet**: Średni
- **Podejście**: Testowanie komponentów w izolacji z różnymi stanami i propami

### 3.5 Testy wydajnościowe
- **Zakres**: Ładowanie strony, renderowanie dużej liczby fiszek, interakcje z AI
- **Narzędzia**: Lighthouse, WebPageTest
- **Priorytet**: Średni
- **Podejście**: Analiza metryk wydajności i optymalizacja wąskich gardeł

### 3.6 Testy dostępności
- **Zakres**: Zgodność z WCAG 2.1 AA
- **Narzędzia**: axe-core, Lighthouse
- **Priorytet**: Średni
- **Podejście**: Automatyczne skanowanie i ręczna weryfikacja

### 3.7 Testy bezpieczeństwa
- **Zakres**: Autoryzacja, uwierzytelnianie, zapytania API
- **Narzędzia**: OWASP ZAP, ręczne testy penetracyjne
- **Priorytet**: Wysoki
- **Podejście**: Testowanie typowych podatności (XSS, CSRF, usterki autoryzacji)

### 3.8 Testy responsywności
- **Zakres**: Różne urządzenia i rozmiary ekranów
- **Narzędzia**: Playwright/Cypress z różnymi viewportami, Device Mode w DevTools
- **Priorytet**: Wysoki
- **Podejście**: Weryfikacja poprawnego wyświetlania na różnych urządzeniach

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1 Zarządzanie fiszkami

#### 4.1.1 Tworzenie nowej fiszki
1. Przejście do formularza tworzenia fiszek
2. Wprowadzenie treści przodu i tyłu fiszki
3. Wybór kategorii i poziomu trudności
4. Zapisanie fiszki
5. Weryfikacja pojawienia się fiszki na liście

#### 4.1.2 Edycja istniejącej fiszki
1. Wybór fiszki z listy
2. Modyfikacja treści przodu i tyłu
3. Zmiana kategorii lub trudności
4. Zapisanie zmian
5. Weryfikacja aktualizacji danych fiszki

#### 4.1.3 Usuwanie fiszki
1. Wybór fiszki z listy
2. Usunięcie fiszki
3. Potwierdzenie usunięcia
4. Weryfikacja braku fiszki na liście

### 4.2 Generowanie fiszek z AI

#### 4.2.1 Generowanie fiszek na podstawie wprowadzonego tekstu
1. Przejście do formularza generowania fiszek
2. Wprowadzenie tekstu opisującego temat
3. Wybór kategorii (opcjonalnie)
4. Inicjacja procesu generowania
5. Weryfikacja wygenerowanych fiszek
6. Zatwierdzenie i zapisanie wybranych fiszek

#### 4.2.2 Testowanie limitów generacji
1. Sprawdzenie limitów generacji dla użytkownika
2. Generowanie fiszek do osiągnięcia limitu
3. Próba wygenerowania dodatkowych fiszek
4. Weryfikacja odpowiedniego komunikatu o limicie

### 4.3 Quiz i nauka

#### 4.3.1 Rozpoczęcie i ukończenie quizu
1. Przejście do strony quizu
2. Wybór kategorii, trudności i liczby pytań
3. Rozpoczęcie quizu
4. Odpowiadanie na pytania quizu
5. Zakończenie quizu
6. Weryfikacja wyświetlenia podsumowania wyników

#### 4.3.2 Filtrowanie pytań quizu
1. Przejście do strony quizu
2. Wybór konkretnej kategorii
3. Wybór poziomu trudności
4. Rozpoczęcie quizu
5. Weryfikacja, czy pytania spełniają wybrane kryteria

### 4.4 Zarządzanie kontem

#### 4.4.1 Rejestracja nowego użytkownika
1. Przejście do strony rejestracji
2. Wprowadzenie danych użytkownika
3. Potwierdzenie rejestracji
4. Weryfikacja utworzenia konta i możliwości logowania

#### 4.4.2 Logowanie użytkownika
1. Przejście do strony logowania
2. Wprowadzenie poprawnych danych
3. Potwierdzenie logowania
4. Weryfikacja przekierowania do panelu głównego

#### 4.4.3 Zmiana hasła
1. Zalogowanie się na konto
2. Przejście do ustawień konta
3. Wprowadzenie starego i nowego hasła
4. Zapisanie zmian
5. Wylogowanie i próba logowania z nowym hasłem

#### 4.4.4 Resetowanie hasła
1. Przejście do strony logowania
2. Wybranie opcji resetowania hasła
3. Wprowadzenie adresu e-mail
4. Otrzymanie linku resetującego
5. Ustawienie nowego hasła
6. Weryfikacja możliwości logowania z nowym hasłem

## 5. Środowisko testowe

### 5.1 Konfiguracja środowiska testowego
- **Środowisko lokalne**: Lokalny serwer deweloperski (Node.js, Astro)
- **Środowisko testowe**: Instancja aplikacji na DigitalOcean z testową bazą danych Supabase
- **Środowisko produkcyjne**: Produkcyjna instancja na DigitalOcean

### 5.2 Wymagania sprzętowe i programowe
- **Przeglądarki**: Chrome, Firefox, Safari, Edge (najnowsze wersje)
- **Urządzenia mobilne**: iPhone (iOS 16+), Android (11+)
- **Serwery**: Node.js 20+, Docker
- **Bazy danych**: PostgreSQL (Supabase)

### 5.3 Dane testowe
- Zestaw predefiniowanych kont użytkowników
- Kolekcje przykładowych fiszek w różnych kategoriach
- Scenariusze dla generowania fiszek przez AI
- Dane do testów wydajnościowych (duże zestawy fiszek)

## 6. Narzędzia do testowania

### 6.1 Narzędzia do testów automatycznych
- **Vitest/Jest**: Testy jednostkowe i integracyjne
- **React Testing Library**: Testowanie komponentów React
- **Playwright/Cypress**: Testy E2E
- **Storybook**: Testowanie i dokumentacja komponentów UI
- **MSW (Mock Service Worker)**: Mockowanie API
- **Supabase Testing Helpers**: Narzędzia do testowania integracji z Supabase

### 6.2 Narzędzia do testów manualnych
- **Browser DevTools**: Debugowanie, analizowanie sieci i wydajności
- **Lighthouse**: Audyty wydajności i dostępności
- **axe DevTools**: Testowanie dostępności
- **Responsively App**: Testowanie responsywności

### 6.3 Narzędzia do zarządzania testami
- **GitHub Issues/Projects**: Śledzenie błędów i zadań
- **GitHub Actions**: CI/CD dla automatycznych testów
- **Playwright Test Report**: Raportowanie wyników testów E2E

## 7. Harmonogram testów

### 7.1 Etapy testowania
1. **Planowanie i przygotowanie (Tydzień 1)**
   - Finalizacja planu testów
   - Konfiguracja środowiska testowego
   - Przygotowanie danych testowych

2. **Implementacja testów jednostkowych i komponentów (Tydzień 2-3)**
   - Utworzenie testów jednostkowych dla kluczowych funkcji
   - Utworzenie testów dla komponentów UI

3. **Implementacja testów integracyjnych (Tydzień 3-4)**
   - Testowanie integracji między komponentami
   - Testowanie integracji z Supabase
   - Testowanie integracji z AI

4. **Implementacja testów E2E (Tydzień 4-5)**
   - Automatyzacja głównych ścieżek użytkownika
   - Testowanie pełnych scenariuszy

5. **Testowanie manualne i specjalistyczne (Tydzień 5-6)**
   - Testy dostępności
   - Testy bezpieczeństwa
   - Testy wydajnościowe
   - Testy responsywności

6. **Testowanie regresji i finalizacja (Tydzień 7)**
   - Wykonanie testów regresji
   - Weryfikacja poprawy znalezionych błędów
   - Finalizacja raportów testowych

### 7.2 Kamienie milowe
- **M1**: Zakończenie implementacji testów jednostkowych (Koniec tygodnia 3)
- **M2**: Zakończenie implementacji testów integracyjnych (Koniec tygodnia 4)
- **M3**: Zakończenie implementacji testów E2E (Koniec tygodnia 5)
- **M4**: Zakończenie testów specjalistycznych (Koniec tygodnia 6)
- **M5**: Finalizacja wszystkich testów (Koniec tygodnia 7)

## 8. Kryteria akceptacji testów

### 8.1 Kryteria wejścia
- Kod źródłowy jest dostępny w repozytorium
- Środowisko testowe jest skonfigurowane
- Wymagania funkcjonalne są jasno zdefiniowane
- Dane testowe są przygotowane

### 8.2 Kryteria wyjścia
- Wszystkie testy wysokiego priorytetu zostały wykonane
- Wszystkie błędy krytyczne i wysokiego priorytetu zostały naprawione
- Pokrycie kodu testami wynosi co najmniej 70% dla kluczowych modułów
- Wyniki testów zostały udokumentowane
- Raporty z testów zostały zaakceptowane przez interesariuszy

### 8.3 Kryteria zawieszenia i wznowienia
- **Zawieszenie**: Więcej niż 40% testów kończy się niepowodzeniem lub wykrycie krytycznego błędu blokującego dalsze testy
- **Wznowienie**: Naprawienie błędów powodujących zawieszenie testów

## 9. Role i odpowiedzialności

### 9.1 Zespół testowy
- **Kierownik testów**: Nadzór nad procesem testowania, raportowanie do interesariuszy
- **Inżynierowie QA**: Implementacja i wykonywanie testów automatycznych, identyfikacja i raportowanie błędów
- **Testerzy manualni**: Wykonywanie testów manualnych, eksploracyjnych i specjalistycznych

### 9.2 Zespół deweloperski
- Implementacja funkcjonalności
- Naprawa zgłoszonych błędów
- Uczestnictwo w przeglądach kodu pod kątem testowalności

### 9.3 Interesariusze
- Zatwierdzanie planu testów
- Uczestnictwo w przeglądach wyników testów
- Decydowanie o gotowości produktu do wdrożenia

## 10. Procedury raportowania błędów

### 10.1 Klasyfikacja błędów
- **Krytyczny**: Błąd powodujący awarię całej aplikacji lub uniemożliwiający korzystanie z kluczowych funkcjonalności
- **Wysoki**: Błąd powodujący nieprawidłowe działanie głównych funkcjonalności
- **Średni**: Błąd wpływający na działanie funkcjonalności, ale mający obejście
- **Niski**: Drobne problemy wizualne, nie wpływające na funkcjonalność

### 10.2 Procedura zgłaszania błędów
1. Utworzenie zgłoszenia w GitHub Issues z odpowiednim szablonem
2. Określenie priorytetu i klasyfikacji błędu
3. Dostarczenie kroków reprodukcji błędu
4. Załączenie dowodów (zrzuty ekranu, logi, nagrania)
5. Przypisanie do odpowiedniego zespołu/osoby

### 10.3 Śledzenie błędów
- Regularne przeglądy statusu błędów
- Aktualizacja statusu błędów po weryfikacji i naprawie
- Raportowanie statystyk błędów (liczba znalezionych, naprawionych, pozostałych)

## 11. Strategie zarządzania ryzykiem

### 11.1 Potencjalne ryzyka
1. **Integracja z Supabase**: Problemy z autoryzacją i synchronizacją danych
2. **Generowanie z AI**: Opóźnienia w odpowiedziach, niepoprawne generacje
3. **Wydajność przy dużej liczbie fiszek**: Spowolnienie aplikacji
4. **Problemy z dostępnością**: Niedostępność dla użytkowników z niepełnosprawnościami
5. **Problemy z responsywnością**: Nieprawidłowe wyświetlanie na różnych urządzeniach

### 11.2 Strategie mitygacji ryzyka
1. **Integracja z Supabase**: Wczesne testy integracyjne, mockowanie odpowiedzi API
2. **Generowanie z AI**: Implementacja timeoutów, cache'owanie wyników, testowanie z różnymi wejściami
3. **Wydajność**: Testy wydajnościowe z dużymi zestawami danych, paginacja, lazy loading
4. **Dostępność**: Regularne audyty WCAG, testowanie z czytnikami ekranowymi
5. **Responsywność**: Testowanie na różnych urządzeniach, podejście mobile-first

## 12. Załączniki

### 12.1 Szablony testowe
- Szablon przypadku testowego
- Szablon raportu z testów
- Szablon zgłoszenia błędu

### 12.2 Diagramy i schematy
- Diagram przepływu procesu testowego
- Diagram integracji z Supabase i OpenRouter.ai
- Mapa ryzyka testowego

### 12.3 Checklista gotowości do wydania
- Lista kontrolna przed wdrożeniem produkcyjnym
- Kryteria akceptacji końcowej 