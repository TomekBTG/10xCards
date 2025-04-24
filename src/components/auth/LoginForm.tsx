import React from "react";
import { useLogin, useToast } from "@/hooks/auth";
import { EmailInput } from "./EmailInput";
import { PasswordInput } from "./PasswordInput";
import { SubmitButton } from "./SubmitButton";
import { ToastNotification } from "./ToastNotification";

export function LoginForm() {
  const { formState, updateField, handleSubmit } = useLogin();
  const { toast, closeToast } = useToast();

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6" aria-labelledby="login-heading">
        <h2 id="login-heading" className="sr-only">
          Formularz logowania
        </h2>

        {formState.errors.form && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200" role="alert" aria-live="assertive">
            <p className="text-sm text-red-700">{formState.errors.form}</p>
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

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary-focus"
              aria-describedby="remember-me-description"
            />
            <label
              id="remember-me-description"
              htmlFor="remember-me"
              className="ml-2 block text-sm text-muted-foreground"
            >
              Zapamiętaj mnie
            </label>
          </div>

          <div className="text-sm">
            <a href="/reset-password" className="font-medium text-primary hover:text-primary/80">
              Zapomniałeś hasła?
            </a>
          </div>
        </div>

        <SubmitButton
          text="Zaloguj się"
          isLoading={formState.isLoading}
          isDisabled={!formState.email || !formState.password}
        />
      </form>

      {toast && <ToastNotification {...toast} onClose={closeToast} />}
    </>
  );
}
