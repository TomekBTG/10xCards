import React, { useState } from "react";
import { useToast, mapErrorMessage } from "@/hooks/auth";
import { EmailInput } from "./EmailInput";
import { SubmitButton } from "./SubmitButton";
import { ToastNotification } from "./ToastNotification";
import { supabaseClient } from "@/db/supabase.client";

interface ResetPasswordFormState {
  email: string;
  isLoading: boolean;
  error?: string;
  success?: string;
}

export function ResetPasswordForm() {
  const [formState, setFormState] = useState<ResetPasswordFormState>({
    email: "",
    isLoading: false,
  });
  const { toast, showToast, closeToast } = useToast();

  const handleEmailChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      email: value,
      error: undefined,
    }));
  };

  const validateForm = (): boolean => {
    if (!formState.email) {
      setFormState((prev) => ({
        ...prev,
        error: "Email jest wymagany",
      }));
      return false;
    }

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formState.email)) {
      setFormState((prev) => ({
        ...prev,
        error: "Wprowadź prawidłowy adres email",
      }));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setFormState((prev) => ({
      ...prev,
      isLoading: true,
      error: undefined,
      success: undefined,
    }));

    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(formState.email, {
        redirectTo: `${window.location.origin}/reset-password-confirm`,
      });

      if (error) {
        throw new Error(error.message);
      }

      setFormState((prev) => ({
        ...prev,
        success: "Instrukcje resetowania hasła zostały wysłane na podany adres email",
      }));

      showToast("success", "Instrukcje resetowania hasła zostały wysłane na podany adres email");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Wystąpił błąd podczas resetowania hasła";

      // Użyj funkcji mapowania błędów
      const userFriendlyMessage = mapErrorMessage(errorMessage);

      setFormState((prev) => ({
        ...prev,
        error: userFriendlyMessage,
      }));

      showToast("error", userFriendlyMessage);
    } finally {
      setFormState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6" aria-labelledby="reset-password-heading">
        <h2 id="reset-password-heading" className="sr-only">
          Formularz resetowania hasła
        </h2>

        {formState.error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200" role="alert" aria-live="assertive">
            <p className="text-sm text-red-700">{formState.error}</p>
          </div>
        )}

        {formState.success && (
          <div className="rounded-md bg-green-50 p-4 border border-green-200" role="status" aria-live="polite">
            <p className="text-sm text-green-700">{formState.success}</p>
          </div>
        )}

        <EmailInput label="Adres email" value={formState.email} error={formState.error} onChange={handleEmailChange} />

        <SubmitButton text="Resetuj hasło" isLoading={formState.isLoading} isDisabled={!formState.email} />

        <div className="text-center">
          <a href="/login" className="text-sm font-medium text-primary hover:text-primary/80">
            Powrót do strony logowania
          </a>
        </div>
      </form>

      {toast && <ToastNotification {...toast} onClose={closeToast} />}
    </>
  );
}
