import React, { useEffect, useState } from "react";
import { useLogin, useToast } from "@/hooks/auth";
import { EmailInput } from "./EmailInput";
import { PasswordInput } from "./PasswordInput";
import { SubmitButton } from "./SubmitButton";
import { ToastNotification } from "./ToastNotification";

export function LoginForm() {
  const { formState, updateField, handleSubmit } = useLogin();
  const { toast, closeToast } = useToast();
  const [isClientSide, setIsClientSide] = useState(false);

  useEffect(() => {
    setIsClientSide(true);
  }, []);

  const isSubmitDisabled = !isClientSide || !formState.email || !formState.password;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6" aria-labelledby="login-heading">
        <h2 id="login-heading" className="sr-only">
          Formularz logowania
        </h2>

        {formState.errors.form && (
          <div className="rounded-md bg-red-900/20 p-4 border border-red-800/30" role="alert" aria-live="assertive">
            <p className="text-sm text-red-400">{formState.errors.form}</p>
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
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-zinc-900"
              aria-describedby="remember-me-description"
            />
            <label id="remember-me-description" htmlFor="remember-me" className="ml-2 block text-sm text-zinc-400">
              Zapamiętaj mnie
            </label>
          </div>

          <div className="text-sm">
            <a href="/reset-password" className="font-medium text-blue-500 hover:text-blue-400">
              Zapomniałeś hasła?
            </a>
          </div>
        </div>

        <SubmitButton text="Zaloguj się" isLoading={formState.isLoading} isDisabled={isSubmitDisabled} />
      </form>

      {toast && <ToastNotification {...toast} onClose={closeToast} />}
    </>
  );
}
