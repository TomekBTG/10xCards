# Architektura UI dla 10xCards

## 1. Przegląd struktury UI
W systemie 10xCards wyróżniamy kluczowe widoki oraz elementy interfejsu, które zapewniają intuicyjną obsługę aplikacji. Architektura UI opiera się na responsywności, dostępności (WCAG AA) oraz integracji z backendowym API. System jest podzielony na widoki autoryzacji, dashboard, generowania i recenzji fiszek, ręcznego dodawania fiszek, biblioteki fiszek, panel użytkownika oraz widok sesji powtórkowych.

## 2. Lista widoków

### Widok Autoryzacji
- Ścieżka widoku: `/login` i `/register`
- Główny cel: Umożliwienie użytkownikom logowania oraz rejestracji.
- Kluczowe informacje: Formularze do logowania i rejestracji (email, hasło) oraz komunikaty błędów.
- Kluczowe komponenty: Formularze, inputy, przyciski, powiadomienia toast.
- Uwagi: Wysoka dostępność, walidacja danych oraz bezpieczeństwo operacji autoryzacyjnych.

### Dashboard
- Ścieżka widoku: `/dashboard`
- Główny cel: Prezentacja statystyk oraz nawigacja do głównych funkcji aplikacji.
- Kluczowe informacje: Statystyki generowanych fiszek, liczby zaakceptowanych/odrzuconych, szybkie linki do generowania fiszek.
- Kluczowe komponenty: Karty statystyk, przyciski nawigacyjne, elementy podsumowujące.
- Uwagi: Intuicyjny interfejs z czytelnymi danymi, responsywność oraz dostępność.

### Widok Generowania Fiszek
- Ścieżka widoku: `/generate`
- Główny cel: Umożliwienie użytkownikowi wprowadzenia tekstu i wygenerowanie fiszek przez AI.
- Kluczowe informacje: Pole tekstowe do wprowadzenia długiego opisu, wymagania dotyczące długości tekstu (min 500, max 10000 znaków), komunikaty walidacyjne.
- Kluczowe komponenty: Formularz, przycisk "Wygeneruj", spinner ładowania, komunikaty o błędach inline.
- Uwagi: Szybka i responsywna walidacja, informacja zwrotna o postępie operacji.

### Widok Ręcznego Dodawania Fiszek
- Ścieżka widoku: `/flashcards/add` lub `/create`
- Główny cel: Umożliwienie użytkownikowi ręcznego tworzenia własnych fiszek.
- Kluczowe informacje: Formularz z polami do wprowadzenia pytania i odpowiedzi, opcje kategoryzacji i stopnia trudności fiszek.
- Kluczowe komponenty: Formularze z walidacją, możliwość dodania wielu fiszek jednocześnie, przycisk "Zapisz".
- Uwagi: Intuicyjny interfejs z walidacją danych, możliwość dodania obrazów lub formatowania tekstu.

### Widok Recenzji Fiszek / Lista Fiszek
- Ścieżka widoku: `/flashcards` lub `/review`
- Główny cel: Przegląd wygenerowanych fiszek oraz możliwość ich edycji lub usunięcia.
- Kluczowe informacje: Lista fiszek z możliwością edycji obu stron, przyciski "Akceptuj", "Edytuj", "Odrzuć".
- Kluczowe komponenty: Lista lub siatka fiszek, modal do edycji, przyciski akcji, powiadomienia toast.
- Uwagi: Walidacja danych, obsługa stanów błędów oraz interakcji użytkownika.

### Widok Biblioteki Fiszek
- Ścieżka widoku: `/library` lub `/flashcards/library`
- Główny cel: Przeglądanie, zarządzanie i organizowanie wszystkich zapisanych fiszek użytkownika.
- Kluczowe informacje: Lista wszystkich fiszek z możliwością filtrowania po statusie, kategoriach, dacie utworzenia.
- Kluczowe komponenty: Zaawansowane opcje filtrowania, sortowania, możliwość tworzenia zestawów, edycja statusu fiszek.
- Uwagi: Efektywne zarządzanie dużą liczbą fiszek, wsparcie dla bulk actions (masowa edycja statusu, usuwanie).

### Panel Użytkownika
- Ścieżka widoku: `/user` lub `/profile`
- Główny cel: Zarządzanie kontem użytkownika (zmiana hasła, edycja danych, usunięcie konta).
- Kluczowe informacje: Dane użytkownika, formularze zmiany hasła, przyciski akcji.
- Kluczowe komponenty: Formularze, modal potwierdzenia, elementy zabezpieczeń.
- Uwagi: Wysokie standardy bezpieczeństwa oraz walidacja operacji.

### Widok Sesji Powtórkowych (Quiz)
- Ścieżka widoku: `/quiz`
- Główny cel: Przeprowadzenie sesji powtórkowych z wykorzystaniem fiszek.
- Kluczowe informacje: Prezentacja fiszek w formie quizu, pytania i odpowiedzi, statystyki sesji.
- Kluczowe komponenty: Widżety quizu, przyciski nawigacyjne, timer.
- Uwagi: Optymalizacja doświadczenia użytkownika, wsparcie dla różnych urządzeń.

## 3. Mapa podróży użytkownika
1. Użytkownik otwiera stronę i trafia do widoku autoryzacji (logowanie/rejestracja).
2. Po pomyślnej autoryzacji, użytkownik jest kierowany do dashboardu, gdzie widzi podsumowanie statystyk.
3. Użytkownik ma kilka ścieżek do wyboru:
   - Przejście do widoku generowania fiszek, gdzie wprowadza tekst i inicjuje proces generowania.
   - Przejście do widoku ręcznego dodawania fiszek, gdzie tworzy własne fiszki.
   - Przejście do biblioteki fiszek, gdzie zarządza istniejącymi fiszkami.
4. Po wygenerowaniu fiszek, użytkownik trafia do widoku recenzji fiszek, gdzie może je edytować, akceptować lub odrzucać.
5. W bibliotece fiszek użytkownik może filtrować, sortować, edytować statusy oraz organizować fiszki w zestawy poprzez kategorie.
6. Użytkownik może przejść do panelu użytkownika, aby zarządzać kontem lub rozpocząć sesję powtórkową (quiz).
7. Przepływy błędne, np. błędy walidacji czy problemy z komunikacją API, są obsługiwane przez komunikaty inline i powiadomienia toast.

## 4. Układ i struktura nawigacji
- Nawigacja jest umieszczona w stałym menu, znajdującym się na górze lub w bocznym pasku.
- Główne elementy menu: Dashboard, Generowanie fiszek, Dodawanie fiszek, Biblioteka fiszek, Recenzja fiszek, Panel użytkownika, Sesja powtórkowa.
- Nawigacja umożliwia łatwe przełączanie się między widokami, z uwzględnieniem mechanizmu SPA lub pełnych przeładowań strony zgodnie z wykorzystanym frameworkiem.
- Menu jest responsywne, z dostosowaniem do urządzeń mobilnych oraz przestrzega standardów dostępności WCAG AA.

## 5. Kluczowe komponenty
- Formularze autoryzacji i rejestracji z walidacją danych.
- Wspólny komponent input do obsługi formularzy.
- Lista/siatka fiszek oraz komponenty do edycji (modal).
- Komponenty filtrowania i sortowania w bibliotece fiszek.
- Komponenty statystyk do prezentacji danych na dashboardzie.
- Toast notifications do przekazywania komunikatów i błędów.
- Responsywny layout z nagłówkiem, stopką oraz menu nawigacyjnym.
- Komponenty quizu (timer, pytania, przyciski) w widoku sesji powtórkowych. 