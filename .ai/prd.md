# Dokument wymagań produktu (PRD) - 10xCards

## 1. Przegląd produktu
Projekt "10xCards" to aplikacja webowa mająca na celu uproszczenie procesu tworzenia fiszek edukacyjnych. Zadaniem projektu jest umożliwienie użytkownikom generowania fiszek za pomocą sztucznej inteligencji na podstawie wprowadzonego tekstu oraz ręcznego tworzenia fiszek. Produkt eliminuje problem czasochłonnego tworzenia fiszek manualnie, co pozwala na efektywne wykorzystanie metody spaced repetition.

## 2. Problem użytkownika
Użytkownicy mają trudności z ręcznym tworzeniem wysokiej jakości fiszek edukacyjnych. Proces ten jest czasochłonny, co zniechęca do efektywnego uczenia się metodą spaced repetition. Brak szybkiego i intuicyjnego narzędzia do generowania fiszek skutkuje niską efektywnością nauki.

## 3. Wymagania funkcjonalne
1. Generowanie fiszek przez AI:
   - Użytkownik wprowadza tekst (kopiuj-wklej) i uruchamia proces generowania.
   - System generuje fiszki dwustronne, z pierwszą stroną o maksymalnie 200 znakach oraz drugą stroną o maksymalnie 500 znakach. Ilość generowanych fiszek po kliknięciu jest uzależniona od długości tekstu wprowadzonego przez użytkownika, system generuje fiszki w ilości od 5 do 15.
   - Po wygenerowaniu fiszek, w trybie AI wyświetlany jest interfejs recenzji z trzema przyciskami (Akceptuj, Edytuj, Odrzuć).
   - Operacja edycji nadpisuje istniejącą treść fiszki.
2. Ręczne tworzenie fiszek:
   - Umożliwienie tworzenia fiszek za pomocą formularza, w którym użytkownik wprowadza treści obu stron.
   - Dane wprowadzane ręcznie są walidowane informacyjnie według ustalonych limitów.
3. Zarządzanie fiszkami:
   - Przeglądanie, edycja oraz usuwanie fiszek zapisanych w bazie danych.
4. System kont użytkowników:
   - Rejestracja, logowanie, zmiana hasła oraz usunięcie konta.
   - Standardowe zabezpieczenia poprzez autentykację, RLS oraz walidację danych.
5. Raportowanie:
   - W trybie AI, system rejestruje operacje generowania fiszek w bazie danych.
   - Raport zawiera informacje o liczbie wygenerowanych i odrzuconych fiszek w ramach danej operacji (dane wewnętrzne).
6. Sesja powtórkowa (Quiz):
   - Ścieżka widoku: `/quiz`
   - Główny cel: Przeprowadzenie sesji powtórkowych z wykorzystaniem fiszek.
   - Prezentacja fiszek w formie quizu: system losowo wybiera fiszki, wyświetla pytanie (pierwszą stronę), umożliwia odsłonięcie odpowiedzi (drugą stroną), użytkownik zaznacza poprawne lub niepoprawne odpowiedzi.
   - Statystyki sesji: liczba poprawnych i niepoprawnych odpowiedzi, czas trwania sesji, procent poprawnych odpowiedzi.
   - Kluczowe komponenty: widżety quizu, przyciski nawigacyjne, timer.
   - Uwagi: optymalizacja doświadczenia użytkownika, wsparcie dla różnych urządzeń.

## 4. Granice produktu
1. Nie implementujemy własnego, zaawansowanego algorytmu powtórek (np. SuperMemo, Anki).
2. Nie wspieramy importu różnych formatów plików (PDF, DOCX itp.).
3. Udostępnianie fiszek między użytkownikami nie jest częścią MVP.
4. Produkt skoncentrowany jest na platformie webowej; aplikacje mobilne nie są przewidziane.
5. Zaawansowane funkcje feedbacku użytkowników poza standardową recenzją (Akceptuj, Edytuj, Odrzuć) nie są zakładane.

## 5. Historyjki użytkowników
- US-001
  - Tytuł: Rejestracja konta użytkownika
  - Opis: Jako niezarejestrowany użytkownik chcę zarejestrować konto, aby móc przechowywać i zarządzać moimi fiszkami.
  - Kryteria akceptacji:
    - Użytkownik może zarejestrować konto przy użyciu unikalnego adresu email.
    - System weryfikuje poprawność danych wejściowych.
- US-002
  - Tytuł: Logowanie do systemu
  - Opis: Jako zarejestrowany użytkownik chcę się zalogować, aby uzyskać dostęp do swojego konta i zapisanych fiszek.
  - Kryteria akceptacji:
    - Użytkownik może logować się przy użyciu prawidłowych danych uwierzytelniających.
    - System zapewnia bezpieczne przetwarzanie danych logowania.
- US-003
  - Tytuł: Generowanie fiszek przez AI
  - Opis: Jako użytkownik chcę wprowadzić tekst i uruchomić generowanie fiszek przez AI, aby szybko otrzymać propozycje edukacyjnych fiszek.
  - Kryteria akceptacji:
    - Użytkownik może wkleić tekst do formularza i uruchomić proces generowania.
    - System generuje fiszki dwustronne z pierwszą stroną do 200 znaków i drugą stroną do 500 znaków.
- US-004
  - Tytuł: Recenzja wygenerowanych fiszek przez AI
  - Opis: Jako użytkownik chcę przeprowadzić recenzję wygenerowanej fiszki w trybie AI, aby wybrać najlepsze fiszki do dalszego użycia.
  - Kryteria akceptacji:
    - Po wygenerowaniu fiszki wyświetlany jest interfejs recenzji z trzema przyciskami: Akceptuj, Edytuj, Odrzuć.
    - Operacja edycji nadpisuje istniejącą treść fiszki.
- US-005
  - Tytuł: Ręczne tworzenie fiszek
  - Opis: Jako użytkownik chcę ręcznie stworzyć fiszkę poprzez wypełnienie formularza, aby wprowadzić własne informacje.
  - Kryteria akceptacji:
    - Użytkownik może wprowadzić dane obu stron fiszki zgodnie z ustalonymi limitami.
    - Po zatwierdzeniu fiszka jest zapisywana w bazie danych.
- US-006
  - Tytuł: Zarządzanie kontem użytkownika
  - Opis: Jako użytkownik chcę mieć możliwość zmiany hasła oraz usunięcia konta, aby zarządzać swoimi danymi.
  - Kryteria akceptacji:
    - Użytkownik może zmienić hasło za pomocą dedykowanego formularza.
    - Użytkownik może usunąć konto, a system potwierdza usunięcie konta i powiązanych danych.
- US-007
  - Tytuł: Sesja powtórkowa (Quiz)
  - Opis: Jako użytkownik chcę przeprowadzić sesję powtórkową w formie quizu z wykorzystaniem wcześniej utworzonych fiszek, aby utrwalić wiedzę przez zadawanie pytań i udzielanie odpowiedzi.
  - Kryteria akceptacji:
    - Użytkownik może przejść do widoku `/quiz`.
    - System losowo wybiera zestaw fiszek na sesję.
    - Dla każdej fiszki system wyświetla pytanie (pierwszą stronę) i po żądaniu odsłania odpowiedź (drugą stroną).
    - Użytkownik może oznaczyć odpowiedź jako poprawną lub niepoprawną.
    - Po zakończeniu quizu wyświetlane są statystyki: liczba poprawnych i niepoprawnych odpowiedzi, procent poprawnych oraz czas trwania sesji.
- US-008
  - Tytuł: Ręczne dodawanie fiszek
  - Opis: Jako użytkownik chcę mieć możliwość ręcznego dodawania fiszek poprzez dedykowany formularz, aby tworzyć własne fiszki bez korzystania z AI.
  - Kryteria akceptacji:
    - Użytkownik może przejść do widoku `/flashcards/add` lub `/create`.
    - Interfejs zawiera formularz z polami do wprowadzenia pytania (pierwsza strona) i odpowiedzi (druga strona).
    - Użytkownik może określić kategorię fiszki oraz stopień trudności.
    - System waliduje wprowadzone dane zgodnie z limitami (pierwsza strona do 200 znaków, druga strona do 500 znaków).
    - Użytkownik może dodać wiele fiszek w ramach jednej sesji.
    - Po zapisaniu fiszki są dodawane do bazy danych i dostępne w bibliotece fiszek.
- US-009
  - Tytuł: Przeglądanie i zarządzanie biblioteką fiszek
  - Opis: Jako użytkownik chcę mieć dostęp do biblioteki wszystkich moich fiszek, aby móc je przeglądać, edytować, filtrować i organizować.
  - Kryteria akceptacji:
    - Użytkownik może przejść do widoku `/library` lub `/flashcards/library`.
    - System wyświetla listę wszystkich fiszek użytkownika z możliwością podglądu obu stron.
    - Interfejs umożliwia filtrowanie fiszek według kategorii, statusu (zaakceptowane, odrzucone) i daty utworzenia.
    - Użytkownik może edytować istniejące fiszki (treść obu stron, kategorię, stopień trudności).
    - System umożliwia zmianę statusu fiszek (pojedynczo lub masowo).
    - Użytkownik może usuwać fiszki z biblioteki.
    - Interfejs pozwala na organizowanie fiszek w kategorie.
- US-010
  - Tytuł: Kontrola dostępu i zarządzanie uprawnieniami
  - Opis: Jako system chcę kontrolować dostęp do różnych części aplikacji na podstawie stanu autoryzacji użytkownika, aby zapewnić bezpieczeństwo danych i odpowiednie doświadczenie użytkownika.
  - Kryteria akceptacji:
    - Strony wymagające autoryzacji (panel główny, generowanie fiszek, biblioteka fiszek, profil, ustawienia, quiz) są dostępne tylko dla zalogowanych użytkowników.
    - Niezalogowani użytkownicy próbujący uzyskać dostęp do chronionych zasobów są automatycznie przekierowywani do strony logowania.
    - Zalogowani użytkownicy nie mają dostępu do stron rejestracji, logowania i resetowania hasła.
    - Próba dostępu zalogowanego użytkownika do stron dla gości skutkuje przekierowaniem do panelu głównego.
    - System poprawnie weryfikuje i aktualizuje stan sesji użytkownika przy każdym żądaniu.
    - Obsługa błędów autoryzacji jest realizowana w spójny i bezpieczny sposób.

## 6. Metryki sukcesu
1. 75% fiszek generowanych przez AI jest akceptowanych przez użytkowników.
2. Użytkownicy tworzą 75% fiszek z wykorzystaniem trybu AI.
3. System rejestruje operacje generowania w bazie danych, co umożliwia analizę liczby wygenerowanych i odrzuconych fiszek.
4. Średni czas interakcji użytkownika z procesem generowania i recenzji fiszek jest minimalny, co wskazuje na intuicyjność i prostotę interfejsu. 

## 7. Uprawnienia użytkowników
### 7.1. Użytkownik zalogowany
- Posiada dostęp do wszystkich funkcjonalności aplikacji, w tym:
  - Panel główny (`/dashboard`) - zarządzanie swoim kontem i dostęp do statystyk.
  - Generowanie fiszek (`/generate`) - korzystanie z funkcji AI do tworzenia fiszek.
  - Biblioteka fiszek (`/library`) - przeglądanie i zarządzanie swoimi fiszkami.
  - Fiszki (`/flashcards`) - tworzenie, edytowanie i usuwanie własnych fiszek.
  - Profil (`/profile`) - zarządzanie danymi osobowymi i preferencjami.
  - Ustawienia (`/settings`) - konfiguracja konta i aplikacji.
  - Quiz (`/quiz`) - przeprowadzanie sesji powtórkowych na podstawie własnych fiszek.
- Nie ma dostępu do:
  - Strony logowania (`/login`) - przekierowany do panelu głównego.
  - Strony rejestracji (`/register`) - przekierowany do panelu głównego.
  - Strony resetowania hasła (`/reset-password`) - przekierowany do panelu głównego.

### 7.2. Użytkownik niezalogowany
- Posiada dostęp wyłącznie do:
  - Strona główna (`/`) - informacje o aplikacji i jej funkcjonalnościach.
  - Strona logowania (`/login`) - logowanie do systemu.
  - Strona rejestracji (`/register`) - rejestracja nowego konta.
  - Strona resetowania hasła (`/reset-password`) - odzyskiwanie dostępu do konta.
- Nie ma dostępu do funkcjonalności wymagających autoryzacji:
  - Panel główny (`/dashboard`)
  - Generowanie fiszek (`/generate`)
  - Biblioteka fiszek (`/library`)
  - Fiszki (`/flashcards`)
  - Profil (`/profile`)
  - Ustawienia (`/settings`)
  - Quiz (`/quiz`)

### 7.3. Mechanizm autoryzacji
- System wykorzystuje sesje do zarządzania dostępem użytkowników.
- Autoryzacja oparta jest na tokenach JWT przechowywanych w ciasteczkach (`sb-auth-token`).
- Middleware aplikacji weryfikuje stan autoryzacji dla każdego żądania.
- Nieprawidłowe próby dostępu skutkują automatycznym przekierowaniem:
  - Niezalogowani użytkownicy próbujący uzyskać dostęp do chronionych zasobów są przekierowywani do `/login`.
  - Zalogowani użytkownicy próbujący uzyskać dostęp do stron tylko dla gości są przekierowywani do `/dashboard`.
- System obsługuje błędy autoryzacji i zapewnia bezpieczne zarządzanie sesjami użytkowników.

## 8. Wymagania bezpieczeństwa
1. Autentykacja:
   - Wszystkie dane uwierzytelniające są przesyłane za pomocą bezpiecznych połączeń HTTPS.
   - Hasła nie są przechowywane w postaci jawnej, tylko jako skróty (hash) z wykorzystaniem silnych algorytmów kryptograficznych.
   - System wykorzystuje mechanizm tokenów JWT do zarządzania sesjami.
   - Tokeny autentykacji są przechowywane w bezpiecznych ciasteczkach HTTP-only.

2. Autoryzacja:
   - System implementuje mechanizm kontroli dostępu oparty na rolach (RBAC) i stanie autoryzacji.
   - Dostęp do zasobów jest weryfikowany na poziomie middleware dla każdego żądania.
   - Implementacja Row Level Security (RLS) w bazie danych zapewnia izolację danych między użytkownikami.