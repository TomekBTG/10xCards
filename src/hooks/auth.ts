import { useState } from "react";
import { type ToastProps, type ToastType } from "@/components/auth/ToastNotification";
import { supabaseClient } from "@/db/supabase.client";

/**
 * Hook for managing toast notifications
 */
export function useToast() {
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = (type: ToastType, message: string, duration = 5000) => {
    setToast({
      type,
      message,
      duration,
      onClose: closeToast,
    });
  };

  const closeToast = () => setToast(null);

  return { toast, showToast, closeToast };
}

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

// Ten interfejs będzie używany kiedy zaimplementujemy integrację z Supabase
/* 
interface AuthCredentials {
  email: string;
  password: string;
}
*/

/**
 * Hook for managing login form state and submission
 */
export function useLogin() {
  const [formState, setFormState] = useState<LoginFormState>({
    email: "",
    password: "",
    isLoading: false,
    errors: {},
  });

  const { showToast } = useToast();

  const updateField = (field: keyof Pick<LoginFormState, "email" | "password">, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
      errors: {
        ...prev.errors,
        [field]: undefined,
        form: undefined,
      },
    }));
  };

  const validateForm = (): boolean => {
    const errors: LoginFormState["errors"] = {};

    // Email validation
    if (!formState.email) {
      errors.email = "Email jest wymagany";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formState.email)) {
      errors.email = "Wprowadź prawidłowy adres email";
    }

    // Password validation
    if (!formState.password) {
      errors.password = "Hasło jest wymagane";
    }

    setFormState((prev) => ({
      ...prev,
      errors,
    }));

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setFormState((prev) => ({
      ...prev,
      isLoading: true,
      errors: {},
    }));

    try {
      const credentials = {
        email: formState.email,
        password: formState.password,
      };

      const { data, error } = await supabaseClient.auth.signInWithPassword(credentials);

      if (error) {
        throw new Error(error.message);
      }

      // Po pomyślnym logowaniu zapisz token w ciasteczku
      if (data && data.session) {
        try {
          // Nazwa ciasteczka sesji Supabase
          const AUTH_COOKIE_NAME = "sb-auth-token";

          // Przygotuj dane sesji do zapisu w ciasteczku
          const sessionData = {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
          };

          // Zapisz token w ciasteczku - będzie widoczny dla serwera
          document.cookie = `${AUTH_COOKIE_NAME}=${JSON.stringify(sessionData)}; path=/; samesite=lax; max-age=${60 * 60 * 24 * 7}`;

          console.log("Token sesji zapisany w ciasteczku");
        } catch (cookieError) {
          console.error("Błąd podczas zapisywania tokena w ciasteczku:", cookieError);
        }
      }

      showToast("success", "Zalogowano pomyślnie");

      // Redirect logic
      window.location.href = "/dashboard";
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Wystąpił błąd podczas logowania";

      // Mapowanie komunikatów błędów z Supabase na bardziej przyjazne użytkownikowi
      const userFriendlyMessage = mapErrorMessage(errorMessage);

      setFormState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          form: userFriendlyMessage,
        },
      }));

      showToast("error", userFriendlyMessage);
    } finally {
      setFormState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  return { formState, updateField, handleSubmit };
}

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

/**
 * Hook for managing register form state and submission
 */
export function useRegister() {
  const [formState, setFormState] = useState<RegisterFormState>({
    email: "",
    password: "",
    passwordConfirmation: "",
    isLoading: false,
    errors: {},
  });

  const { showToast } = useToast();

  const updateField = (
    field: keyof Pick<RegisterFormState, "email" | "password" | "passwordConfirmation">,
    value: string
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
      errors: {
        ...prev.errors,
        [field]: undefined,
        form: undefined,
      },
    }));
  };

  const validateForm = (): boolean => {
    const errors: RegisterFormState["errors"] = {};

    // Email validation
    if (!formState.email) {
      errors.email = "Email jest wymagany";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formState.email)) {
      errors.email = "Wprowadź prawidłowy adres email";
    }

    // Password validation
    if (!formState.password) {
      errors.password = "Hasło jest wymagane";
    } else if (formState.password.length < 8) {
      errors.password = "Hasło musi zawierać minimum 8 znaków";
    }

    // Password confirmation validation
    if (!formState.passwordConfirmation) {
      errors.passwordConfirmation = "Potwierdzenie hasła jest wymagane";
    } else if (formState.password !== formState.passwordConfirmation) {
      errors.passwordConfirmation = "Hasła nie są identyczne";
    }

    setFormState((prev) => ({
      ...prev,
      errors,
    }));

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setFormState((prev) => ({
      ...prev,
      isLoading: true,
      errors: {},
    }));

    try {
      const credentials = {
        email: formState.email,
        password: formState.password,
      };

      const { error } = await supabaseClient.auth.signUp(credentials);

      if (error) {
        throw new Error(error.message);
      }

      // Wylogowanie użytkownika po rejestracji
      await supabaseClient.auth.signOut();

      // Usuwamy stary token sesji, jeśli istnieje
      const AUTH_COOKIE_NAME = "sb-auth-token";
      document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

      showToast("success", "Zarejestrowano pomyślnie. Sprawdź swoją skrzynkę email, aby potwierdzić rejestrację.");

      // Przekierowanie na stronę logowania natychmiast, bez czekania
      window.location.href = "/login";
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Wystąpił błąd podczas rejestracji";

      // Mapowanie komunikatów błędów z Supabase na bardziej przyjazne użytkownikowi
      const userFriendlyMessage = mapErrorMessage(errorMessage);

      setFormState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          form: userFriendlyMessage,
        },
      }));

      showToast("error", userFriendlyMessage);
    } finally {
      setFormState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  return { formState, updateField, handleSubmit };
}

/**
 * Mapuje komunikaty błędów z Supabase na bardziej przyjazne użytkownikowi
 * @param errorMessage - oryginalna wiadomość błędu
 * @returns - przyjazna dla użytkownika wiadomość błędu
 */
export function mapErrorMessage(errorMessage: string): string {
  // Komunikaty dotyczące logowania
  if (errorMessage.includes("Invalid login credentials")) {
    return "Nieprawidłowy email lub hasło";
  } else if (errorMessage.includes("Email not confirmed")) {
    return "Email nie został potwierdzony. Sprawdź swoją skrzynkę email";
  }

  // Komunikaty dotyczące rejestracji
  else if (errorMessage.includes("User already registered")) {
    return "Konto z podanym adresem email już istnieje";
  } else if (errorMessage.includes("Password should be at least 6 characters")) {
    return "Hasło powinno zawierać co najmniej 6 znaków";
  }

  // Komunikaty dotyczące resetowania hasła
  else if (errorMessage.includes("JWT expired")) {
    return "Token resetowania hasła wygasł. Spróbuj zresetować hasło ponownie.";
  } else if (errorMessage.includes("User not found")) {
    return "Nie znaleziono użytkownika. Spróbuj zresetować hasło ponownie.";
  }

  // Komunikaty dotyczące limitów
  else if (errorMessage.includes("rate limit")) {
    return "Przekroczono limit prób. Spróbuj ponownie później";
  }

  // Ogólne problemy z połączeniem
  else if (errorMessage.includes("network error") || errorMessage.includes("Failed to fetch")) {
    return "Problem z połączeniem internetowym. Sprawdź swoje połączenie i spróbuj ponownie.";
  }

  // Jeśli nie mamy dedykowanego komunikatu, zwracamy oryginalny
  return errorMessage;
}
