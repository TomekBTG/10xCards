import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/auth";
import { PasswordInput } from "./PasswordInput";
import { SubmitButton } from "./SubmitButton";
import { ToastNotification } from "./ToastNotification";
import { supabase } from "@/db/supabase";
import { mapErrorMessage } from "@/hooks/auth";

interface ResetPasswordConfirmFormState {
  password: string;
  passwordConfirmation: string;
  isLoading: boolean;
  errors: {
    password?: string;
    passwordConfirmation?: string;
    form?: string;
  };
  success?: string;
}

export function ResetPasswordConfirmForm() {
  const [formState, setFormState] = useState<ResetPasswordConfirmFormState>({
    password: "",
    passwordConfirmation: "",
    isLoading: false,
    errors: {},
  });

  const { toast, showToast, closeToast } = useToast();
  const [hashError, setHashError] = useState<string | null>(null);

  useEffect(() => {
    // Sprawdź, czy w URL jest hash, który jest wymagany do resetowania hasła
    const hash = window.location.hash;
    if (!hash || hash.length < 10) {
      setHashError("Nieprawidłowy lub brakujący token resetowania hasła w adresie URL.");
    }
  }, []);

  const updateField = (
    field: keyof Pick<ResetPasswordConfirmFormState, "password" | "passwordConfirmation">,
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
    const errors: ResetPasswordConfirmFormState["errors"] = {};

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
      success: undefined,
    }));

    try {
      const { error } = await supabase.auth.updateUser({
        password: formState.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      setFormState((prev) => ({
        ...prev,
        success: "Hasło zostało pomyślnie zmienione",
        password: "",
        passwordConfirmation: "",
      }));

      showToast(
        "success",
        "Hasło zostało pomyślnie zmienione. Za chwilę zostaniesz przekierowany na stronę logowania."
      );

      // Przekieruj na stronę logowania po 3 sekundach
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Wystąpił błąd podczas zmiany hasła";

      // Przyjazny komunikat błędu
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

  // Jeśli brak tokena resetowania hasła, wyświetl komunikat błędu
  if (hashError) {
    return (
      <div className="rounded-md bg-red-50 p-4 border border-red-200" role="alert" aria-live="assertive">
        <p className="text-sm text-red-700">{hashError}</p>
        <div className="mt-4">
          <a href="/reset-password" className="text-sm font-medium text-primary hover:text-primary/80">
            Wróć do formularza resetowania hasła
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {formState.errors.form && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200" role="alert" aria-live="assertive">
            <p className="text-sm text-red-700">{formState.errors.form}</p>
          </div>
        )}

        {formState.success && (
          <div className="rounded-md bg-green-50 p-4 border border-green-200" role="status" aria-live="polite">
            <p className="text-sm text-green-700">{formState.success}</p>
          </div>
        )}

        <PasswordInput
          label="Nowe hasło"
          value={formState.password}
          error={formState.errors.password}
          onChange={(value) => updateField("password", value)}
          placeholder="Minimum 8 znaków"
        />

        <PasswordInput
          label="Potwierdź nowe hasło"
          value={formState.passwordConfirmation}
          error={formState.errors.passwordConfirmation}
          onChange={(value) => updateField("passwordConfirmation", value)}
          placeholder="Powtórz hasło"
        />

        <SubmitButton
          text="Zmień hasło"
          isLoading={formState.isLoading}
          isDisabled={!formState.password || !formState.passwordConfirmation}
        />
      </form>

      {toast && <ToastNotification {...toast} onClose={closeToast} />}
    </>
  );
}
