# Plan implementacji widoku Dashboard

## 1. Przegląd
Widok Dashboard ma na celu prezentację kluczowych statystyk związanych z fiszkami (np. liczba wygenerowanych, zaakceptowanych, odrzuconych) oraz zapewnienie szybkiej nawigacji do głównych funkcji aplikacji, takich jak generowanie nowych fiszek i przegląd zapisanych fiszek. Interfejs powinien być intuicyjny, responsywny i dostępny na różnych urządzeniach.

## 2. Routing widoku
Widok Dashboard będzie dostępny pod ścieżką `/dashboard`.

## 3. Struktura komponentów
- **DashboardHeader** – opcjonalny komponent zawierający logo oraz główną nawigację.
- **DashboardStatsSection** – sekcja wyświetlająca karty statystyk, prezentujące m.in. liczbę wygenerowanych, zaakceptowanych i odrzuconych fiszek.
- **NavigationPanel** – panel z przyciskami/odnośnikami umożliwiający szybkie przejście do generowania fiszek i przeglądu zapisanych fiszek.
- **DashboardSummary** – komponent opcjonalny wyświetlający dodatkowe informacje lub podsumowanie ostatnich aktywności.

## 4. Szczegóły komponentów
### DashboardStatsCard
- **Opis**: Komponent prezentujący pojedynczą statystykę (np. liczba zaakceptowanych fiszek).
- **Główne elementy**: Ikona reprezentująca statystykę, wartość liczbową oraz etykieta.
- **Obsługiwane interakcje**: Brak – komponent wyłącznie prezentacyjny.
- **Warunki walidacji**: Wartość statystyki musi być liczbą większą lub równą 0.
- **Typy**: DashboardStatsDTO (z polami: label: string, value: number).
- **Propsy**: Obiekt statystyki przekazany z rodzica.

### NavigationPanel
- **Opis**: Panel zawierający interaktywne przyciski umożliwiające nawigację do głównych sekcji aplikacji (np. generowanie fiszek, przegląd fiszek).
- **Główne elementy**: Przycisk (button) dla każdej akcji oraz ewentualna ikona.
- **Obsługiwane interakcje**: Kliknięcia przycisków powodujące nawigację lub wywołanie funkcji.
- **Warunki walidacji**: Sprawdzenie, czy właściwości nawigacyjne (label, route) są poprawnie określone.
- **Typy**: NavButtonDTO (interfejs z polami: label: string, route: string).
- **Propsy**: Tablica przycisków z akcjami nawigacyjnymi.

### DashboardSummary
- **Opis**: Komponent wyświetlający dodatkowe informacje, np. podsumowanie ostatnich aktywności użytkownika lub historii generacji fiszek.
- **Główne elementy**: Tekst, ewentualnie ikony i linki do szczegółowych widoków.
- **Obsługiwane interakcje**: Kliknięcia elementów umożliwiające przejście do szczegółowych raportów.
- **Warunki walidacji**: Dane podsumowujące muszą być aktualne i poprawnie załadowane.
- **Typy**: DashboardSummaryDTO (np. z polami: recentGenerations: Array<{ id: string, date: string, count: number }>).
- **Propsy**: Obiekt podsumowujący przekazany z rodzica.

## 5. Typy
- **DashboardStatsDTO**: 
  - label: string
  - value: number
- **NavButtonDTO**:
  - label: string
  - route: string
- **DashboardSummaryDTO** (opcjonalnie): 
  - recentGenerations: Array<{ id: string, date: string, count: number }>
- **DashboardViewModel**: Obiekt łączący dane statystyk, przyciski nawigacyjne oraz podsumowanie.

## 6. Zarządzanie stanem
- Użycie hooka `useState` do przechowywania danych statystyk oraz stanu ładowania i błędów.
- Utworzenie customowego hooka `useDashboardStats` do pobierania danych z API i zarządzania logiką ładowania.
- Aktualizacja stanu po otrzymaniu danych z endpointów oraz obsługa przypadków, gdy dane nie są dostępne.

## 7. Integracja API
- Pobieranie danych statystycznych z dedykowanych endpointów (np. z logów generacji fiszek lub agregacji danych z API flashcards). 
- Wysyłanie żądania GET do endpointu, który zwraca statystyki w formacie odpowiadającym DashboardStatsDTO.
- Obsługa odpowiedzi: przetwarzanie danych, uaktualnienie widoku oraz zarządzanie stanem błędów.

## 8. Interakcje użytkownika
- Kliknięcie w przyciski w NavigationPanel będzie powodowało przekierowanie do odpowiednich sekcji (np. generowanie fiszek, przegląd fiszek).
- Ewentualne kliknięcie w elementy statystyk lub podsumowania może otwierać szczegółowe widoki lub modale z dodatkowymi informacjami.
- Responsywność: komponenty będą dostosowywać się do rozmiarów ekranu, z możliwym użyciem menu hamburgera na urządzeniach mobilnych.

## 9. Warunki i walidacja
- Dane statystyczne muszą być liczbowe i większe lub równe 0.
- Widok powinien wykrywać, czy dane zostały poprawnie załadowane – w przypadku braku danych wyświetlać stan ładowania (loader) lub komunikat o błędzie.
- Przycisk nawigacyjny aktywowany tylko wtedy, gdy odpowiednie dane są dostępne (np. sprawdzenie dostępności opcji generowania fiszek).

## 10. Obsługa błędów
- W przypadku niepowodzenia pobierania danych z API, wyświetlić czytelny komunikat o błędzie.
- Zaimplementować fallback UI dla sytuacji, gdy dane nie są dostępne lub wystąpił błąd sieciowy.
- Dodatkowo, logować błędy do konsoli oraz (opcjonalnie) do zewnętrznego systemu monitoringu.

## 11. Kroki implementacji
1. Utworzyć nowy widok: plik `src/pages/dashboard.astro` lub `src/pages/dashboard/index.astro`.
2. Zaimplementować główny layout Dashboard, ewentualnie wykorzystując istniejący layout aplikacji.
3. Utworzyć komponenty:
   - `DashboardStatsCard` w `src/components` (lub `src/components/ui`).
   - `NavigationPanel` dla przycisków nawigacyjnych.
   - `DashboardSummary` (opcjonalnie) dla dodatkowych informacji.
4. Zdefiniować nowe typy w `src/types.ts` lub w osobnym pliku typów dedykowanym dla Dashboardu.
5. Stworzyć customowy hook `useDashboardStats` w `src/lib` lub `src/hooks` do pobierania danych statystyk z API.
6. Zaimplementować integrację z API – stworzyć odpowiednie funkcje do pobierania danych statystycznych.
7. Zastosować Tailwind CSS do stylowania widoku, zapewniając responsywność i dostępność.
8. Przeprowadzić testy interfejsu użytkownika, sprawdzając działanie na różnych urządzeniach.
9. Wprowadzić ewentualne poprawki oraz zoptymalizować kod na podstawie feedbacku.
10. Zintegrować widok z główną aplikacją i przeprowadzić końcowe testy funkcjonalne. 