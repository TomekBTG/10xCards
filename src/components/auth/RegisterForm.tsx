import React from "react";
import { useRegister, useToast } from "@/hooks/auth";
import { EmailInput } from "./EmailInput";
import { PasswordInput } from "./PasswordInput";
import { SubmitButton } from "./SubmitButton";
import { ToastNotification } from "./ToastNotification";

export function RegisterForm() {
  const { formState, updateField, handleSubmit } = useRegister();
  const { toast, closeToast } = useToast();

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6" aria-labelledby="register-heading">
        <h2 id="register-heading" className="sr-only">
          Formularz rejestracji
        </h2>

        {formState.errors.form && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800" role="alert" aria-live="assertive">
            <p className="text-sm text-red-700 dark:text-red-400">{formState.errors.form}</p>
          </div>
        )}

        <EmailInput
          label="Adres email"
          value={formState.email}
          error={formState.errors.email}
          onChange={(value) => updateField("email", value)}
        />

        <PasswordInput
          label="Hasło"
          value={formState.password}
          error={formState.errors.password}
          onChange={(value) => updateField("password", value)}
        />

        <PasswordInput
          label="Potwierdź hasło"
          value={formState.passwordConfirmation}
          error={formState.errors.passwordConfirmation}
          onChange={(value) => updateField("passwordConfirmation", value)}
        />

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary-focus"
            required
            aria-describedby="terms-description"
          />
          <label id="terms-description" htmlFor="terms" className="ml-2 block text-sm text-muted-foreground">
            Akceptuję{" "}
            <a href="/terms" className="font-medium text-primary hover:text-primary/80">
              Warunki korzystania
            </a>{" "}
            oraz{" "}
            <a href="/privacy" className="font-medium text-primary hover:text-primary/80">
              Politykę prywatności
            </a>
          </label>
        </div>

        <SubmitButton
          text="Zarejestruj się"
          isLoading={formState.isLoading}
          isDisabled={
            !formState.email ||
            !formState.password ||
            !formState.passwordConfirmation ||
            formState.password !== formState.passwordConfirmation
          }
        />
      </form>

      {toast && <ToastNotification {...toast} onClose={closeToast} />}
    </>
  );
}
