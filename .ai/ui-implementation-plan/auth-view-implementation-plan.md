# Plan implementacji widoku Autoryzacji

## 1. Przegląd
Widok Autoryzacji to kluczowy element aplikacji 10xCards, który umożliwia użytkownikom rejestrację nowych kont oraz logowanie do istniejących kont. Jest to punkt wejścia do aplikacji, pozwalający na bezpieczny dostęp do funkcjonalności generowania i zarządzania fiszkami edukacyjnymi zgodnie z wymaganiami biznesowymi.

## 2. Routing widoku
- `/login` - strona logowania do systemu
- `/register` - strona rejestracji nowego konta

## 3. Struktura komponentów
```
- AuthLayout (wspólny layout dla obu stron)
  |- LoginForm (na ścieżce /login)
     |- EmailInput
     |- PasswordInput
     |- SubmitButton
  |- RegisterForm (na ścieżce /register)
     |- EmailInput
     |- PasswordInput
     |- PasswordConfirmationInput
     |- SubmitButton
  |- ToastNotification (globalny komponent powiadomień)
```

## 4. Szczegóły komponentów
### AuthLayout
- Opis komponentu: Wspólny układ dla stron logowania i rejestracji, zapewniający spójny wygląd i zachowanie.
- Główne elementy: Logo aplikacji, kontener na formularze, stopka, link do przełączania między rejestracją a logowaniem.
- Obsługiwane interakcje: Nawigacja między widokami logowania i rejestracji.
- Obsługiwana walidacja: Brak.
- Typy: `AuthPageProps`.
- Propsy: `children: ReactNode, pageTitle: string, alternateLink: string, alternateLinkText: string`.

### LoginForm
- Opis komponentu: Formularz umożliwiający użytkownikom logowanie do aplikacji za pomocą adresu email i hasła.
- Główne elementy: Formularze z polami email i hasło, przycisk logowania, informacja o możliwości rejestracji.
- Obsługiwane interakcje: Wprowadzanie danych, walidacja w czasie rzeczywistym, wysyłanie formularza.
- Obsługiwana walidacja:
  - Email: format prawidłowego adresu email.
  - Hasło: niepuste pole.
- Typy: `LoginFormState`, `LoginCredentials`.
- Propsy: Brak (komponent samodzielny).

### RegisterForm
- Opis komponentu: Formularz umożliwiający nowym użytkownikom rejestrację konta w aplikacji.
- Główne elementy: Formularze z polami email, hasło i potwierdzenie hasła, przycisk rejestracji, link do logowania.
- Obsługiwane interakcje: Wprowadzanie danych, walidacja w czasie rzeczywistym, wysyłanie formularza.
- Obsługiwana walidacja:
  - Email: format prawidłowego adresu email, unikalność (weryfikowana przez API).
  - Hasło: minimalna długość 8 znaków.
  - Potwierdzenie hasła: zgodność z wprowadzonym hasłem.
- Typy: `RegisterFormState`, `RegisterCredentials`.
- Propsy: Brak (komponent samodzielny).

### EmailInput
- Opis komponentu: Komponent pola formularza do wprowadzania adresu email.
- Główne elementy: Pole tekstowe, etykieta, komunikat błędu.
- Obsługiwane interakcje: Wprowadzanie tekstu, utrata fokusa.
- Obsługiwana walidacja: Format poprawnego adresu email (regex).
- Typy: `InputProps`.
- Propsy: `label: string, value: string, error?: string, onChange: (value: string) => void, onBlur?: () => void`.

### PasswordInput
- Opis komponentu: Komponent pola formularza do wprowadzania hasła.
- Główne elementy: Pole hasła, etykieta, przycisk pokazania/ukrycia hasła, komunikat błędu.
- Obsługiwane interakcje: Wprowadzanie tekstu, przełączanie widoczności hasła, utrata fokusa.
- Obsługiwana walidacja: Zgodnie z wymaganiami dla hasła (długość, złożoność).
- Typy: `PasswordInputProps`.
- Propsy: `label: string, value: string, error?: string, onChange: (value: string) => void, onBlur?: () => void`.

### SubmitButton
- Opis komponentu: Przycisk służący do wysyłania formularzy.
- Główne elementy: Przycisk z tekstem, opcjonalny loader podczas stanu ładowania.
- Obsługiwane interakcje: Kliknięcie.
- Obsługiwana walidacja: Brak.
- Typy: `SubmitButtonProps`.
- Propsy: `text: string, isLoading: boolean, isDisabled?: boolean, onClick?: () => void`.

### ToastNotification
- Opis komponentu: Komponent do wyświetlania powiadomień (sukces, błąd, informacja).
- Główne elementy: Kontener z wiadomością, ikoną i przyciskiem zamknięcia.
- Obsługiwane interakcje: Automatyczne zamknięcie po określonym czasie, ręczne zamknięcie.
- Obsługiwana walidacja: Brak.
- Typy: `ToastProps`, `ToastType`.
- Propsy: `type: ToastType, message: string, duration?: number, onClose?: () => void`.

## 5. Typy
```typescript
// Props for the AuthLayout component
interface AuthPageProps {
  children: ReactNode;
  pageTitle: string;
  alternateLink: string;
  alternateLinkText: string;
}

// Login form state
interface LoginFormState {
  email: string;
  password: string;
  isLoading: boolean;
  errors: {
    email?: string;
    password?: string;
    form?: string;
  };
}

// Login credentials for API call
interface LoginCredentials {
  email: string;
  password: string;
}

// Registration form state
interface RegisterFormState {
  email: string;
  password: string;
  passwordConfirmation: string;
  isLoading: boolean;
  errors: {
    email?: string;
    password?: string;
    passwordConfirmation?: string;
    form?: string;
  };
}

// Registration credentials for API call
interface RegisterCredentials {
  email: string;
  password: string;
}

// Props for input components
interface InputProps {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

// Props extending InputProps for password input
interface PasswordInputProps extends InputProps {
  showPasswordToggle?: boolean;
}

// Props for submit button
interface SubmitButtonProps {
  text: string;
  isLoading: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
}

// Toast notification types
type ToastType = 'success' | 'error' | 'info';

// Props for toast notification
interface ToastProps {
  type: ToastType;
  message: string;
  duration?: number;
  onClose?: () => void;
}
```

## 6. Zarządzanie stanem
Do zarządzania stanem widoku autoryzacji zostaną wykorzystane hooki React:

### useLogin (niestandardowy hook)
```typescript
function useLogin() {
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
    isLoading: false,
    errors: {}
  });
  
  // Metoda do aktualizacji pól formularza
  const updateField = (field: keyof Pick<LoginFormState, 'email' | 'password'>, value: string) => {...};
  
  // Metoda do walidacji formularza
  const validateForm = (): boolean => {...};
  
  // Metoda do wysyłania formularza
  const handleSubmit = async (e: React.FormEvent) => {...};
  
  // Zwracane wartości i metody
  return { formState, updateField, handleSubmit };
}
```

### useRegister (niestandardowy hook)
```typescript
function useRegister() {
  const [formState, setFormState] = useState<RegisterFormState>({
    email: '',
    password: '',
    passwordConfirmation: '',
    isLoading: false,
    errors: {}
  });
  
  // Metoda do aktualizacji pól formularza
  const updateField = (field: keyof Pick<RegisterFormState, 'email' | 'password' | 'passwordConfirmation'>, value: string) => {...};
  
  // Metoda do walidacji formularza
  const validateForm = (): boolean => {...};
  
  // Metoda do wysyłania formularza
  const handleSubmit = async (e: React.FormEvent) => {...};
  
  // Zwracane wartości i metody
  return { formState, updateField, handleSubmit };
}
```

### useToast (niestandardowy hook dla powiadomień)
```typescript
function useToast() {
  const [toast, setToast] = useState<ToastProps | null>(null);
  
  // Metoda do wyświetlania powiadomienia
  const showToast = (type: ToastType, message: string, duration = 5000) => {...};
  
  // Metoda do zamykania powiadomienia
  const closeToast = () => setToast(null);
  
  // Zwracane wartości i metody
  return { toast, showToast, closeToast };
}
```

## 7. Integracja API
Integracja z Supabase Auth do obsługi autoryzacji:

### Logowanie
```typescript
// Wywołanie logowania
const { data, error } = await supabase.auth.signInWithPassword({
  email: credentials.email,
  password: credentials.password
});

// Obsługa odpowiedzi
if (error) {
  // Obsługa błędu logowania
} else {
  // Zapisanie sesji i przekierowanie
}
```

### Rejestracja
```typescript
// Wywołanie rejestracji
const { data, error } = await supabase.auth.signUp({
  email: credentials.email,
  password: credentials.password
});

// Obsługa odpowiedzi
if (error) {
  // Obsługa błędu rejestracji
} else {
  // Informacja o sukcesie, możliwe automatyczne logowanie
}
```

## 8. Interakcje użytkownika
### Logowanie
1. Użytkownik wprowadza adres email i hasło.
2. System waliduje wprowadzone dane w czasie rzeczywistym.
3. Po kliknięciu przycisku "Zaloguj":
   - Wyświetla się spinner ładowania.
   - Dane są wysyłane do API.
   - W przypadku sukcesu, użytkownik jest przekierowywany do głównej strony aplikacji.
   - W przypadku błędu, wyświetlane jest powiadomienie z informacją o błędzie.
4. Link "Zarejestruj się" przekierowuje do formularza rejestracji.

### Rejestracja
1. Użytkownik wprowadza adres email, hasło i potwierdzenie hasła.
2. System waliduje wprowadzone dane w czasie rzeczywistym.
3. Po kliknięciu przycisku "Zarejestruj":
   - Wyświetla się spinner ładowania.
   - Dane są wysyłane do API.
   - W przypadku sukcesu, wyświetlane jest powiadomienie o udanej rejestracji.
   - W przypadku błędu, wyświetlane jest powiadomienie z informacją o błędzie.
4. Link "Zaloguj się" przekierowuje do formularza logowania.

## 9. Warunki i walidacja
### Walidacja adresu email
- Format prawidłowego adresu email (wyrażenie regularne).
- Komunikat błędu: "Wprowadź prawidłowy adres email".
- Dotyczy komponentów: EmailInput w LoginForm i RegisterForm.

### Walidacja hasła (rejestracja)
- Minimalna długość: 8 znaków.
- Komunikat błędu: "Hasło musi zawierać minimum 8 znaków.
- Dotyczy komponentu: PasswordInput w RegisterForm.

### Walidacja potwierdzenia hasła
- Musi być identyczne z wprowadzonym hasłem.
- Komunikat błędu: "Hasła nie są identyczne".
- Dotyczy komponentu: PasswordConfirmationInput w RegisterForm.

### Walidacja formularza logowania
- Pole email nie może być puste.
- Pole hasło nie może być puste.
- Przycisk "Zaloguj" jest aktywny tylko gdy wszystkie pola są poprawnie wypełnione.

### Walidacja formularza rejestracji
- Pole email nie może być puste i musi być prawidłowym adresem email.
- Pole hasło musi spełniać wszystkie kryteria złożoności.
- Pole potwierdzenia hasła musi być zgodne z hasłem.
- Przycisk "Zarejestruj" jest aktywny tylko gdy wszystkie pola są poprawnie wypełnione.

## 10. Obsługa błędów
### Błędy logowania
- Nieprawidłowy adres email lub hasło: "Nieprawidłowe dane logowania".
- Problem z połączeniem: "Nie można połączyć się z serwerem. Sprawdź połączenie z internetem".
- Konto zablokowane: "Konto zostało zablokowane. Skontaktuj się z administratorem".

### Błędy rejestracji
- Email już istnieje: "Konto z podanym adresem email już istnieje".
- Hasło nie spełnia wymagań: Szczegółowa informacja o wymaganiach dla hasła.
- Błąd serwera: "Wystąpił problem techniczny. Spróbuj ponownie później".

### Ogólne błędy
- Przekroczenie limitu prób logowania: "Przekroczono limit prób logowania. Spróbuj ponownie później".
- Błąd autoryzacji: "Wystąpił błąd podczas autoryzacji. Spróbuj ponownie".

## 11. Kroki implementacji
1. Utworzenie struktury katalogów zgodnie z konwencją projektu:
   - `/src/components/auth/` - katalog dla komponentów autoryzacji
   - `/src/hooks/auth.ts` - hooki związane z autoryzacją
   - `/src/pages/login.astro` i `/src/pages/register.astro` - strony Astro

2. Implementacja podstawowych komponentów UI:
   - EmailInput
   - PasswordInput
   - SubmitButton
   - ToastNotification

3. Implementacja niestandardowych hooków:
   - useLogin
   - useRegister
   - useToast

4. Implementacja formularzy:
   - LoginForm
   - RegisterForm

5. Implementacja wspólnego layoutu:
   - AuthLayout

6. Integracja z Supabase Auth:
   - Konfiguracja klienta Supabase
   - Implementacja metod logowania i rejestracji

7. Implementacja stron Astro:
   - login.astro
   - register.astro

8. Implementacja mechanizmów przekierowania:
   - Przekierowanie zalogowanych użytkowników z `/login` i `/register` do głównej strony
   - Przekierowanie niezalogowanych użytkowników z chronionych stron do `/login`

9. Testowanie:
   - Testy jednostkowe komponentów
   - Testy integracyjne formularzy
   - Testy end-to-end procesów logowania i rejestracji

10. Optymalizacja dostępności i UX:
    - Sprawdzenie zgodności z WCAG
    - Dopracowanie komunikatów błędów
    - Usprawnienie nawigacji klawiaturą 