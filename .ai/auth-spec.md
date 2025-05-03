# Specyfikacja modułu autentykacji

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1. Układ stron i layoutów
- **Public Layout**:
  - Astro layout dla stron publicznych (np. `/`, `/login`, `/register`, `/reset-password`).
  - Minimalna logika JavaScript; wykorzystanie server-side rendering.
- **Authenticated Layout**:
  - Astro layout dla stron dostępnych tylko dla zalogowanych użytkowników (np. `/dashboard`, `/profile`, `/settings`, `/flashcards`, `/generate`, `/library`).
  - Middleware w `./src/middleware/index.ts` sprawdza stan sesji i przekierowuje niezalogowanych do `/login`.
  - Strony wymagające autoryzacji są zdefiniowane w tablicy `PROTECTED_ROUTES` w middleware.
  - Strony dostępne tylko dla niezalogowanych (np. logowanie, rejestracja) są zdefiniowane w tablicy `GUEST_ONLY_ROUTES`.

### 1.2. Komponenty i formularze
- **Formularze autoryzacyjne** (logowanie, rejestracja, reset hasła):
  - Komponenty React umieszczone w `./src/components/auth/`:
    - `LoginForm.tsx` - formularz logowania
    - `RegisterForm.tsx` - formularz rejestracji
    - `ResetPasswordForm.tsx` - formularz inicjujący reset hasła
    - `ResetPasswordConfirmForm.tsx` - formularz potwierdzający reset hasła
    - `AuthLayout.tsx` - wspólny layout dla formularzy autoryzacyjnych
  - **Komponenty pomocnicze**:
    - `EmailInput.tsx` - komponent do wprowadzania adresu email
    - `PasswordInput.tsx` - komponent do wprowadzania hasła
    - `SubmitButton.tsx` - przycisk submit z obsługą stanu ładowania
    - `ToastNotification.tsx` - komponent powiadomień
  - Stylizacja za pomocą Tailwind CSS oraz komponenty z Shadcn/ui.
  - Walidacja danych po stronie klienta (format email, minimalna długość hasła, zgodność pól przy rejestracji).
  - Wyświetlanie komunikatów błędów inline (np. "Nieprawidłowy email", "Hasło zbyt krótkie", "Hasła nie są identyczne").

### 1.3. Integracja z backendem
- **Hooki React do zarządzania stanem formularzy**:
  - `useLogin` - zarządzanie stanem formularza logowania i obsługa żądań do API
  - `useRegister` - zarządzanie stanem formularza rejestracji i obsługa żądań do API
  - `useToast` - zarządzanie stanem powiadomień
  - Funkcje pomocnicze, np. `mapErrorMessage` do mapowania komunikatów błędów na przyjazne dla użytkownika
- **Scenariusze użycia**:
  - **Rejestracja**: Walidacja formularza ➜ wywołanie `Supabase.auth.signUp()` ➜ przekierowanie do strony logowania po pomyślnej rejestracji.
  - **Logowanie**: Walidacja danych ➜ wywołanie `Supabase.auth.signInWithPassword()` ➜ zapisanie tokenu w ciasteczkach (HTTP-only) ➜ przekierowanie do panelu użytkownika.
  - **Reset hasła**: Podanie adresu email ➜ wywołanie `Supabase.auth.resetPasswordForEmail()` ➜ wysłanie e-maila z linkiem resetującym.
  - **Zmiana hasła**: Podanie aktualnego hasła i nowego hasła ➜ wywołanie endpointu `/api/auth/change-password` ➜ aktualizacja hasła w Supabase.
  - **Usunięcie konta**: Potwierdzenie przez użytkownika ➜ wywołanie endpointu `/api/auth/delete-account` ➜ usunięcie konta z Supabase.

## 2. LOGIKA BACKENDOWA

### 2.1. Endpointy API
- **POST `/api/auth/change-password`**:
  - Dane wejściowe: aktualne hasło, nowe hasło, potwierdzenie nowego hasła.
  - Walidacja z użyciem Zod oraz weryfikacja aktualnego hasła.
  - Aktualizacja hasła za pomocą `Supabase.auth.updateUser()`.
  - Odpowiedź: sukces lub szczegółowy błąd.
- **POST `/api/auth/delete-account`**:
  - Dane wejściowe: hasło użytkownika (dla potwierdzenia).
  - Weryfikacja hasła i usunięcie konta.
  - Odpowiedź: sukces lub szczegółowy błąd.

### 2.2. Bezpośrednie wywołania Supabase Auth
- Niektóre operacje są wykonywane bezpośrednio przez hooki React bez dedykowanych endpointów:
  - Rejestracja: `Supabase.auth.signUp()`
  - Logowanie: `Supabase.auth.signInWithPassword()`
  - Reset hasła: `Supabase.auth.resetPasswordForEmail()`
  - Wylogowanie: `Supabase.auth.signOut()`

### 2.3. Walidacja i obsługa wyjątków
- Walidacja danych wejściowych z wykorzystaniem biblioteki Zod.
- Implementacja "early returns" w przypadku błędów dla przejrzystości kodu.
- Szczegółowe mapowanie komunikatów błędów Supabase na przyjazne dla użytkownika wiadomości.
- Obsługa różnych scenariuszy błędów: nieprawidłowe dane uwierzytelniające, problemy z siecią, błędy serwera.

### 2.4. Aktualizacja renderowania stron
- Strony renderowane server-side (SSR) sprawdzają stan sesji poprzez middleware.
- Konfiguracja `astro.config.mjs` wykorzystuje adapter node w trybie standalone oraz integracje React i Tailwind.

## 3. SYSTEM AUTENTYKACJI

### 3.1. Integracja z Supabase Auth
- Klient Supabase zdefiniowany w `./src/db/supabase.client.ts` i `./src/db/supabase.ts`.
- Wykorzystanie metod Supabase do zarządzania cyklem życia użytkownika:
  - `signUp` – rejestracja nowych użytkowników.
  - `signInWithPassword` – logowanie użytkowników.
  - `signOut` – wylogowywanie użytkowników.
  - `resetPasswordForEmail` – inicjowanie procedury resetu hasła.
  - `updateUser` – aktualizacja danych użytkownika, w tym hasła.
- Po udanym logowaniu token JWT jest przekazywany w ciasteczkach HTTP-only (nazwa ciasteczka: `sb-auth-token`).

### 3.2. Zarządzanie sesjami i bezpieczeństwo
- Middleware w `./src/middleware/index.ts` weryfikuje tokeny przy każdym żądaniu do stron chronionych:
  - Wyodrębnienie tokenu z ciasteczka.
  - Ustawienie tokenu sesji w kliencie Supabase.
  - Weryfikacja i odświeżanie sesji.
  - Przekierowanie niezalogowanych użytkowników do strony logowania.
  - Przekierowanie zalogowanych użytkowników z powrotem do dashboardu, gdy próbują uzyskać dostęp do stron publicznych.
- Implementacja Row Level Security (RLS) w Supabase zabezpiecza dane użytkowników.
- Zabezpieczone endpointy API sprawdzają stan uwierzytelnienia z kontekstu Astro locals.

## 4. MECHANIZMY POWIADOMIEŃ I KOMUNIKATY BŁĘDÓW

### 4.1. System powiadomień
- Komponent `ToastNotification.tsx` do wyświetlania powiadomień o sukcesie lub błędzie.
- Hook `useToast` zarządzający stanem powiadomień (typ, treść, czas wyświetlania).
- Automatyczne zamykanie powiadomień po określonym czasie.

### 4.2. Mapowanie komunikatów błędów
- Funkcja `mapErrorMessage` w `hooks/auth.ts` tłumaczy techniczne komunikaty błędów Supabase na przyjazne dla użytkownika.
- Specyficzne komunikaty dla różnych scenariuszy błędów:
  - Błędy logowania (nieprawidłowe dane, email niepotwierdzony).
  - Błędy rejestracji (użytkownik już istnieje, nieprawidłowe hasło).
  - Błędy resetowania hasła (wygasły token, nieznaleziony użytkownik).
  - Problemy z połączeniem i limitami prób.

## Wnioski końcowe
Moduł autentykacji implementuje:
- Modularną architekturę z jasnym podziałem odpowiedzialności między komponentami React.
- Centralnie zarządzany stan formularzy i powiadomień poprzez dedykowane hooki.
- Bezpieczną integrację z Supabase Auth z obsługą tokenów JWT.
- Szczegółową walidację danych wejściowych i przyjazne dla użytkownika komunikaty błędów.
- Logiczną strukturę przepływu użytkownika przez proces rejestracji, logowania i resetowania hasła.
- Rozszerzone funkcje zarządzania kontem, takie jak zmiana hasła i usuwanie konta.

<!-- End of Authentication Module Specification -->