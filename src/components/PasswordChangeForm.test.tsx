import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordChangeForm from './PasswordChangeForm';
import { useProfileActions } from '../lib/hooks/useProfileActions';
import { useToast } from '../lib/hooks/useToast';

// Definiujemy typ odpowiedzi dla changePassword, aby uwzględnić właściwość error
type ChangePasswordResponse = {
  success: boolean;
  error?: string;
};

// Mockujemy hooki używane w komponencie
const successToastMock = vi.fn();
const errorToastMock = vi.fn();

vi.mock('../lib/hooks/useToast', () => ({
  useToast: () => ({
    success: successToastMock,
    error: errorToastMock,
    info: vi.fn(),
    warning: vi.fn()
  })
}));

// Tworzymy mock funkcji changePassword
const changePasswordMockFn = vi.fn<any, Promise<ChangePasswordResponse>>(() => Promise.resolve({ success: true }));

vi.mock('../lib/hooks/useProfileActions', () => ({
  useProfileActions: () => ({
    changePassword: changePasswordMockFn
  })
}));

// Tworzymy wrapper kontekstu, jeśli jest potrzebny
const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui);
};

describe('PasswordChangeForm', () => {
  // Mockowane funkcje do testowania wywołań
  beforeEach(() => {
    // Resetowanie wszystkich mocków przed każdym testem
    changePasswordMockFn.mockClear();
    successToastMock.mockClear();
    errorToastMock.mockClear();
    
    // Czyszczenie poprzednich wywołań mocków
    vi.clearAllMocks();
  });

  it('renderuje formularz zmiany hasła ze wszystkimi polami', () => {
    renderWithProviders(<PasswordChangeForm />);
    
    // Sprawdzamy czy wszystkie pola formularza są obecne, używając dokładnych selektorów
    expect(screen.getByLabelText(/^aktualne hasło/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^nowe hasło\*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^potwierdź nowe hasło/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zmień hasło/i })).toBeInTheDocument();
  });

  it('wyświetla błędy walidacji gdy formularz jest pusty', async () => {
    renderWithProviders(<PasswordChangeForm />);
    
    // Kliknięcie przycisku submit bez wypełnienia pól
    await userEvent.click(screen.getByRole('button', { name: /zmień hasło/i }));
    
    // Sprawdzamy czy pojawiły się komunikaty błędów
    expect(screen.getByText(/aktualne hasło jest wymagane/i)).toBeInTheDocument();
    expect(screen.getByText(/nowe hasło jest wymagane/i)).toBeInTheDocument();
    expect(screen.getByText(/potwierdzenie hasła jest wymagane/i)).toBeInTheDocument();
  });

  it('wyświetla błąd gdy nowe hasło jest za krótkie', async () => {
    renderWithProviders(<PasswordChangeForm />);
    
    // Wypełniamy formularz z za krótkim hasłem
    await userEvent.type(screen.getByLabelText(/^aktualne hasło/i), 'obecneHaslo123');
    await userEvent.type(screen.getByLabelText(/^nowe hasło\*$/i), 'abc123');
    await userEvent.type(screen.getByLabelText(/^potwierdź nowe hasło/i), 'abc123');
    
    await userEvent.click(screen.getByRole('button', { name: /zmień hasło/i }));
    
    // Sprawdzamy czy pojawił się komunikat o zbyt krótkim haśle
    expect(screen.getByText(/hasło musi mieć co najmniej 8 znaków/i)).toBeInTheDocument();
  });

  it('wyświetla błąd gdy hasła nie są zgodne', async () => {
    renderWithProviders(<PasswordChangeForm />);
    
    // Wypełniamy formularz z różnymi hasłami
    await userEvent.type(screen.getByLabelText(/^aktualne hasło/i), 'obecneHaslo123');
    await userEvent.type(screen.getByLabelText(/^nowe hasło\*$/i), 'noweHaslo123');
    await userEvent.type(screen.getByLabelText(/^potwierdź nowe hasło/i), 'noweHasloInneTekst');
    
    await userEvent.click(screen.getByRole('button', { name: /zmień hasło/i }));
    
    // Sprawdzamy czy pojawił się komunikat o niezgodnych hasłach
    expect(screen.getByText(/hasła nie są identyczne/i)).toBeInTheDocument();
  });

  it('wysyła poprawne dane do API gdy formularz jest prawidłowo wypełniony', async () => {
    // Konfigurujemy mock do zwracania sukcesu
    changePasswordMockFn.mockResolvedValueOnce({ success: true });
    
    renderWithProviders(<PasswordChangeForm />);
  
    // Wypełniamy formularz poprawnymi danymi
    await userEvent.type(screen.getByLabelText(/^aktualne hasło/i), 'obecneHaslo123');
    await userEvent.type(screen.getByLabelText(/^nowe hasło\*$/i), 'noweHaslo123');
    await userEvent.type(screen.getByLabelText(/^potwierdź nowe hasło/i), 'noweHaslo123');
    
    // Symulujemy kliknięcie przycisku submit bezpośrednio
    const submitButton = screen.getByRole('button', { name: /zmień hasło/i });
    await userEvent.click(submitButton);
    
    // Logujemy dla debugowania
    console.log('Liczba wywołań changePassword:', changePasswordMockFn.mock.calls.length);
    if (changePasswordMockFn.mock.calls.length > 0) {
      console.log('Argumenty wywołania changePassword:', JSON.stringify(changePasswordMockFn.mock.calls[0]));
    } else {
      console.log('Funkcja changePassword nie została wywołana');
    }
    
    // Sprawdzamy czy funkcja API została wywołana z poprawnymi danymi
    await waitFor(() => {
      expect(changePasswordMockFn).toHaveBeenCalledWith({
        current_password: 'obecneHaslo123',
        new_password: 'noweHaslo123',
        confirm_password: 'noweHaslo123'
      });
    });
  });

  it('wyświetla komunikat sukcesu po pomyślnej zmianie hasła', async () => {
    // Konfigurujemy mock do zwracania sukcesu
    changePasswordMockFn.mockResolvedValueOnce({ success: true });
    
    renderWithProviders(<PasswordChangeForm />);
    
    // Wypełniamy formularz
    await userEvent.type(screen.getByLabelText(/^aktualne hasło/i), 'obecneHaslo123');
    await userEvent.type(screen.getByLabelText(/^nowe hasło\*$/i), 'noweHaslo123');
    await userEvent.type(screen.getByLabelText(/^potwierdź nowe hasło/i), 'noweHaslo123');
    
    // Symulujemy kliknięcie przycisku submit
    const submitButton = screen.getByRole('button', { name: /zmień hasło/i });
    await userEvent.click(submitButton);
    
    // Sprawdzamy czy wyświetlił się komunikat sukcesu
    await waitFor(() => {
      expect(successToastMock).toHaveBeenCalledWith('Hasło zostało zmienione pomyślnie');
    });
    
    // Sprawdzamy czy formularz został zresetowany
    await waitFor(() => {
      expect(screen.getByLabelText(/^aktualne hasło/i)).toHaveValue('');
      expect(screen.getByLabelText(/^nowe hasło\*$/i)).toHaveValue('');
      expect(screen.getByLabelText(/^potwierdź nowe hasło/i)).toHaveValue('');
    });
  });

  it('wyświetla błąd z API gdy zmiana hasła nie powiodła się', async () => {
    // Konfigurujemy mock do zwracania błędu
    const errorMessage = 'Nieprawidłowe aktualne hasło';
    changePasswordMockFn.mockResolvedValueOnce({ 
      success: false, 
      error: errorMessage 
    });
    
    renderWithProviders(<PasswordChangeForm />);
    
    // Wypełniamy formularz
    await userEvent.type(screen.getByLabelText(/^aktualne hasło/i), 'zleHaslo123');
    await userEvent.type(screen.getByLabelText(/^nowe hasło\*$/i), 'noweHaslo123');
    await userEvent.type(screen.getByLabelText(/^potwierdź nowe hasło/i), 'noweHaslo123');
    
    // Symulujemy kliknięcie przycisku submit
    const submitButton = screen.getByRole('button', { name: /zmień hasło/i });
    await userEvent.click(submitButton);
    
    // Sprawdzamy czy wyświetlił się komunikat błędu z API
    await waitFor(() => {
      expect(errorToastMock).toHaveBeenCalledWith(errorMessage);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('obsługuje nieoczekiwane błędy podczas zmiany hasła', async () => {
    // Konfigurujemy mock do rzucania wyjątku
    changePasswordMockFn.mockRejectedValueOnce(new Error('Unexpected error'));
    
    renderWithProviders(<PasswordChangeForm />);
    
    // Wypełniamy formularz
    await userEvent.type(screen.getByLabelText(/^aktualne hasło/i), 'obecneHaslo123');
    await userEvent.type(screen.getByLabelText(/^nowe hasło\*$/i), 'noweHaslo123');
    await userEvent.type(screen.getByLabelText(/^potwierdź nowe hasło/i), 'noweHaslo123');
    
    // Mockujemy console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Symulujemy kliknięcie przycisku submit
    const submitButton = screen.getByRole('button', { name: /zmień hasło/i });
    await userEvent.click(submitButton);
    
    // Sprawdzamy czy wyświetlił się komunikat o nieoczekiwanym błędzie
    await waitFor(() => {
      expect(errorToastMock).toHaveBeenCalledWith('Wystąpił nieoczekiwany błąd podczas zmiany hasła');
      expect(screen.getByText(/wystąpił nieoczekiwany błąd/i)).toBeInTheDocument();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    // Przywracamy oryginalny console.error
    consoleErrorSpy.mockRestore();
  });

  it('blokuje przyciski podczas ładowania', async () => {
    // Konfigurujemy mock, aby czekał dłużej z odpowiedzią
    changePasswordMockFn.mockImplementationOnce(() => new Promise(resolve => {
      setTimeout(() => resolve({ success: true }), 100);
    }));
    
    renderWithProviders(<PasswordChangeForm />);
    
    // Wypełniamy formularz
    await userEvent.type(screen.getByLabelText(/^aktualne hasło/i), 'obecneHaslo123');
    await userEvent.type(screen.getByLabelText(/^nowe hasło\*$/i), 'noweHaslo123');
    await userEvent.type(screen.getByLabelText(/^potwierdź nowe hasło/i), 'noweHaslo123');
    
    // Symulujemy kliknięcie przycisku submit
    const submitButton = screen.getByRole('button', { name: /zmień hasło/i });
    await userEvent.click(submitButton);
    
    // Sprawdzamy czy podczas ładowania pola formularza są zablokowane
    expect(screen.getByLabelText(/^aktualne hasło/i)).toBeDisabled();
    expect(screen.getByLabelText(/^nowe hasło\*$/i)).toBeDisabled();
    expect(screen.getByLabelText(/^potwierdź nowe hasło/i)).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveTextContent(/zmiana hasła.../i);
    
    // Czekamy na zakończenie operacji
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
      expect(screen.getByRole('button')).toHaveTextContent(/zmień hasło/i);
    });
  });
}); 