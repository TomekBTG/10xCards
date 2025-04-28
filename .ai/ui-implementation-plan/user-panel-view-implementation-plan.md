# Plan implementacji widoku Panel Użytkownika

## 1. Przegląd
Panel Użytkownika pozwala zalogowanemu użytkownikowi na zarządzanie własnym kontem — zmianę hasła oraz usunięcie konta. Widok zapewnia bezpieczne operacje na kontach zgodnie z wymaganiami PRD (US-006).

## 2. Routing widoku
Ścieżka strony: `/user` i `/profile` (obie trasy wskazują na ten sam komponent strony).

## 3. Struktura komponentów
```
UserPanelPage (Astro + React)
├─ UserProfileDetails
├─ PasswordChangeForm
│   └─ ToastNotification
├─ DeleteAccountSection
│   └─ ConfirmationModal
└─ ToastNotification (globalny kontekst)
```

## 4. Szczegóły komponentów

### UserProfileDetails
- Opis: Wyświetla podstawowe dane użytkownika (email, imię).
- Główne elementy:
  - Nagłówek z nazwą użytkownika/email.
  - Opcjonalne pola read-only z dodatkowymi danymi.
- Obsługiwane interakcje: brak (informacyjny).
- Walidacja: brak.
- Typy:
  - `User` (z `supabase.auth.getUser`): `{ id: string; email: string; ... }`
- Propsy:
  - `user: User`

### PasswordChangeForm
- Opis: Formularz do zmiany hasła.
- Główne elementy:
  - Pole `currentPassword` (type=password)
  - Pole `newPassword` (type=password)
  - Pole `confirmNewPassword` (type=password)
  - Przycisk `Zmień hasło` (loading/EQ)
- Obsługiwane interakcje:
  - onChange każdego pola
  - onSubmit formularza
- Walidacja:
  - Wszystkie pola wymagane
  - `newPassword.length >= 8`
  - `newPassword === confirmNewPassword`
- Typy:
  - DTO żądania: `UpdatePasswordCommand`:
    ```ts
    interface UpdatePasswordCommand {
      current_password: string;
      new_password: string;
      confirm_password: string;
    }
    ```
  - FormState:
    ```ts
    interface PasswordChangeFormState {
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
      isLoading: boolean;
      errors: {
        currentPassword?: string;
        newPassword?: string;
        confirmNewPassword?: string;
        form?: string;
      };
    }
    ```
- Propsy: brak (samodzielny formularz korzystający z hooków)

### DeleteAccountSection
- Opis: Sekcja umożliwiająca usunięcie konta.
- Główne elementy:
  - Przycisk `Usuń konto`
  - Komponent `ConfirmationModal` (z Shadcn/ui)
- Obsługiwane interakcje:
  - Kliknięcie `Usuń konto` → toggle modala
  - Kliknięcie `Potwierdź` w modalu → wywołanie API
  - Kliknięcie `Anuluj` → zamknięcie modala
- Walidacja:
  - (opcjonalnie) pole hasła w modalu wymagane
- Typy:
  - DTO żądania: `DeleteAccountCommand`:
    ```ts
    interface DeleteAccountCommand {
      password?: string;
    }
    ```
  - State:
    ```ts
    interface DeleteAccountState {
      isModalOpen: boolean;
      password: string;
      isLoading: boolean;
      error?: string;
    }
    ```
- Propsy: brak

### ConfirmationModal
- Opis: Modal potwierdzenia akcji.
- Główne elementy:
  - Nagłówek i treść komunikatu
  - (opcjonalnie) pola inputu
  - Przyciski `Potwierdź` i `Anuluj`
- Obsługiwane interakcje: onConfirm, onCancel
- Walidacja: wbudowana w rodzicu
- Typy:
  - Propsy:
    ```ts
    interface ConfirmationModalProps {
      isOpen: boolean;
      title: string;
      description: string;
      confirmLabel: string;
      cancelLabel: string;
      onConfirm: () => void;
      onCancel: () => void;
    }
    ```

## 5. Typy
```ts
// DTO
interface UpdatePasswordCommand {
  current_password: string;
  new_password: string;
  confirm_password: string;
}
interface DeleteAccountCommand {
  password?: string;
}

// ViewModel
interface PasswordChangeFormState { /* ... */ }
interface DeleteAccountState { /* ... */ }
interface ConfirmationModalProps { /* ... */ }
```  
Typy importować w `src/types.ts` lub utworzyć `src/types/auth.ts`.

## 6. Zarządzanie stanem
- Globalny `useToast()` dla powiadomień.
- Custom hook `useUser()` do pobrania danych konta.
- Custom hook `useProfileActions()`:
  - `changePassword(cmd: UpdatePasswordCommand)`: `supabase.auth.updateUser` lub POST `/api/auth/change-password`
  - `deleteAccount(cmd?: DeleteAccountCommand)`: `supabase.auth.deleteUser` lub DELETE `/api/auth/delete-account`
- Lokalne stany w formularzach i modalach.

## 7. Integracja API
- Change password:
  ```ts
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  ```  
  lub POST `/api/auth/change-password` z payload.
- Delete account:
  ```ts
  const { error } = await supabase.auth.deleteUser();
  ```  
  lub DELETE `/api/auth/delete-account`.
- Obsługa odpowiedzi:
  - Brak błędu → toast success, ewentualny redirect
  - Błąd → pokazanie błędów w formularzu + toast error

## 8. Interakcje użytkownika
1. Otwiera panel → dane użytkownika w `UserProfileDetails`
2. Wypełnia formularz zmiany hasła → klika `Zmień hasło` → walidacja → API → toast
3. Klika `Usuń konto` → modal → potwierdza → API → wylogowanie/redirect

## 9. Warunki i walidacja
- `currentPassword` i `newPassword` niepuste
- `newPassword.length >= 8`
- `newPassword === confirmNewPassword`
- (Modal) potwierdzenie
- Wyniki walidacji blokują wysyłkę

## 10. Obsługa błędów
- Pokazanie inline błędów przy polach formularzy
- Jeśli API zwróci błąd (np. niepoprawne hasło), przypisać go do `form.errors.form`
- Pokazanie toastów error/success
- Przekierowanie do logowania przy sesji nieaktualnej

## 11. Kroki implementacji
1. Utworzyć plik `src/pages/profile.astro` (lub `user.astro`) z client-only wrapperem React.
2. Zaimplementować hook `useUser()` do pobierania danych użytkownika.
3. Dodać definicje nowych typów w `src/types/auth.ts`.
4. Napisać komponent `UserProfileDetails`.
5. Napisać `PasswordChangeForm` z useState, walidacją i obsługą API.
6. Napisać `DeleteAccountSection` i `ConfirmationModal`.
7. Skorzystać z `useToast()` we wszystkich formularzach.
8. Dopisać style Tailwind i komponenty Shadcn/ui.
9. Dodać automatyczne testy integracyjne dla formularzy.
10. Zintegrować endpointy i przetestować przepływy.
