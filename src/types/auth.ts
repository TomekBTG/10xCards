// Types for authentication and user profile
import type { User } from "@supabase/supabase-js";

// Export User type for components
export type { User };

// DTO for commands
export interface UpdatePasswordCommand {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface DeleteAccountCommand {
  password?: string;
}

// View models and state interfaces
export interface PasswordChangeFormState {
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

export interface DeleteAccountState {
  isModalOpen: boolean;
  password: string;
  isLoading: boolean;
  error?: string;
}

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}
