import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../lib/hooks/useToast";
import { useProfileActions } from "../lib/hooks/useProfileActions";
import type { PasswordChangeFormState, UpdatePasswordCommand } from "../types/auth";

/**
 * Password change form component
 * Allows users to change their password
 */
const PasswordChangeForm: React.FC = () => {
  const { changePassword } = useProfileActions();
  const { success, error } = useToast();

  const [formState, setFormState] = useState<PasswordChangeFormState>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    isLoading: false,
    errors: {},
  });

  // Helper function to validate form before submission
  const validateForm = (): boolean => {
    const errors: PasswordChangeFormState["errors"] = {};

    if (!formState.currentPassword) {
      errors.currentPassword = "Aktualne hasło jest wymagane";
    }

    if (!formState.newPassword) {
      errors.newPassword = "Nowe hasło jest wymagane";
    } else if (formState.newPassword.length < 8) {
      errors.newPassword = "Hasło musi mieć co najmniej 8 znaków";
    }

    if (!formState.confirmNewPassword) {
      errors.confirmNewPassword = "Potwierdzenie hasła jest wymagane";
    } else if (formState.newPassword !== formState.confirmNewPassword) {
      errors.confirmNewPassword = "Hasła nie są identyczne";
    }

    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
      errors: {
        ...prev.errors,
        [name]: undefined, // Clear error when user types
        form: undefined, // Clear form error
      },
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form inputs
    if (!validateForm()) {
      return;
    }

    // Set loading state
    setFormState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Prepare command for API
      const command: UpdatePasswordCommand = {
        current_password: formState.currentPassword,
        new_password: formState.newPassword,
        confirm_password: formState.confirmNewPassword,
      };

      // Call API
      const result = await changePassword(command);

      if (result.success) {
        // Reset form on success
        setFormState({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
          isLoading: false,
          errors: {},
        });

        // Show success message
        success("Hasło zostało zmienione pomyślnie");
      } else {
        // Show error from API
        setFormState((prev) => ({
          ...prev,
          isLoading: false,
          errors: {
            ...prev.errors,
            form: result.error,
          },
        }));

        error(result.error || "Wystąpił błąd podczas zmiany hasła");
      }
    } catch (err) {
      // Handle unexpected errors
      setFormState((prev) => ({
        ...prev,
        isLoading: false,
        errors: {
          ...prev.errors,
          form: "Wystąpił nieoczekiwany błąd podczas zmiany hasła",
        },
      }));

      error("Wystąpił nieoczekiwany błąd podczas zmiany hasła");
      console.error("Error in password change form:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Current password field */}
      <div className="space-y-2">
        <Label htmlFor="currentPassword">
          Aktualne hasło<span className="text-destructive">*</span>
        </Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          value={formState.currentPassword}
          onChange={handleInputChange}
          disabled={formState.isLoading}
          aria-invalid={!!formState.errors.currentPassword}
        />
        {formState.errors.currentPassword && (
          <p className="text-sm text-destructive">{formState.errors.currentPassword}</p>
        )}
      </div>

      {/* New password field */}
      <div className="space-y-2">
        <Label htmlFor="newPassword">
          Nowe hasło<span className="text-destructive">*</span>
        </Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          value={formState.newPassword}
          onChange={handleInputChange}
          disabled={formState.isLoading}
          aria-invalid={!!formState.errors.newPassword}
        />
        {formState.errors.newPassword && <p className="text-sm text-destructive">{formState.errors.newPassword}</p>}
      </div>

      {/* Confirm new password field */}
      <div className="space-y-2">
        <Label htmlFor="confirmNewPassword">
          Potwierdź nowe hasło<span className="text-destructive">*</span>
        </Label>
        <Input
          id="confirmNewPassword"
          name="confirmNewPassword"
          type="password"
          value={formState.confirmNewPassword}
          onChange={handleInputChange}
          disabled={formState.isLoading}
          aria-invalid={!!formState.errors.confirmNewPassword}
        />
        {formState.errors.confirmNewPassword && (
          <p className="text-sm text-destructive">{formState.errors.confirmNewPassword}</p>
        )}
      </div>

      {/* Form level error message */}
      {formState.errors.form && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{formState.errors.form}</div>
      )}

      {/* Submit button */}
      <Button type="submit" className="w-full" disabled={formState.isLoading}>
        {formState.isLoading ? "Zmiana hasła..." : "Zmień hasło"}
      </Button>
    </form>
  );
};

export default PasswordChangeForm;
