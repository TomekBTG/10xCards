import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../lib/hooks/useToast";
import { useProfileActions } from "../lib/hooks/useProfileActions";
import ConfirmationModal from "./ConfirmationModal";
import type { DeleteAccountState, DeleteAccountCommand } from "../types/auth";

/**
 * Delete account section component
 * Allows users to delete their account with confirmation
 */
const DeleteAccountSection: React.FC = () => {
  const { deleteAccount } = useProfileActions();
  const { success, error } = useToast();

  const [state, setState] = useState<DeleteAccountState>({
    isModalOpen: false,
    password: "",
    isLoading: false,
    error: undefined,
  });

  // Handle opening the confirmation modal
  const handleOpenModal = () => {
    setState((prev) => ({
      ...prev,
      isModalOpen: true,
      password: "",
      error: undefined,
    }));
  };

  // Handle closing the confirmation modal
  const handleCloseModal = () => {
    setState((prev) => ({
      ...prev,
      isModalOpen: false,
      password: "",
      error: undefined,
    }));
  };

  // Handle password input change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({
      ...prev,
      password: e.target.value,
      error: undefined,
    }));
  };

  // Handle account deletion confirmation
  const handleConfirmDeletion = async () => {
    if (state.isLoading) return;

    // Validation
    if (!state.password) {
      setState((prev) => ({
        ...prev,
        error: "Hasło jest wymagane do potwierdzenia",
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Prepare command for API
      const command: DeleteAccountCommand = {
        password: state.password,
      };

      // Call API
      const result = await deleteAccount(command);

      if (result.success) {
        // Close modal and show success message
        setState({
          isModalOpen: false,
          password: "",
          isLoading: false,
          error: undefined,
        });

        success("Konto zostało usunięte pomyślnie. Nastąpi przekierowanie do strony logowania.");

        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        // Show error
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: result.error,
        }));

        error(result.error || "Wystąpił błąd podczas usuwania konta");
      }
    } catch (err) {
      // Handle unexpected errors
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Wystąpił nieoczekiwany błąd podczas usuwania konta",
      }));

      error("Wystąpił nieoczekiwany błąd podczas usuwania konta");
      console.error("Error in account deletion:", err);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Usunięcie konta jest nieodwracalne. Wszystkie Twoje dane zostaną permanentnie usunięte.
      </p>

      <Button variant="destructive" onClick={handleOpenModal}>
        Usuń konto
      </Button>

      <ConfirmationModal
        isOpen={state.isModalOpen}
        title="Potwierdzenie usunięcia konta"
        description="Ta operacja jest nieodwracalna. Wszystkie Twoje dane zostaną permanentnie usunięte. Proszę wprowadź swoje hasło, aby potwierdzić."
        confirmLabel={state.isLoading ? "Usuwanie..." : "Usuń konto"}
        cancelLabel="Anuluj"
        onConfirm={handleConfirmDeletion}
        onCancel={handleCloseModal}
      >
        <div className="space-y-2">
          <Label htmlFor="confirm-password">
            Hasło<span className="text-destructive">*</span>
          </Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="Wprowadź hasło"
            value={state.password}
            onChange={handlePasswordChange}
            disabled={state.isLoading}
          />
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default DeleteAccountSection;
