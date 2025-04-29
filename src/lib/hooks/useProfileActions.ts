import { supabaseClient } from "../../db/supabase.client";
import { isAuthenticated } from "../../db/supabase";
import type { DeleteAccountCommand, UpdatePasswordCommand } from "../../types/auth";

/**
 * Custom hook for managing user profile actions
 * @returns Object with methods for profile management actions
 */
export function useProfileActions() {
  /**
   * Changes the user's password
   * @param command Password change command containing current and new password
   * @returns Result object with success flag and optional error message
   */
  const changePassword = async (command: UpdatePasswordCommand) => {
    try {
      // Próba zmiany hasła przez endpoint API
      try {
        const response = await fetch("/api/auth/change-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(command),
        });

        const result = await response.json();

        if (response.ok) {
          return { success: true };
        } else {
          return {
            success: false,
            error: result.error || "Wystąpił błąd podczas zmiany hasła",
          };
        }
      } catch (apiError) {
        console.error("API error, falling back to direct Supabase call:", apiError);
        // Jeśli endpoint API nie zadziała, używamy bezpośredniego wywołania Supabase
      }

      // Bezpośrednie wywołanie Supabase - mechanizm awaryjny
      // Sprawdź czy użytkownik jest zalogowany
      await supabaseClient.auth.getSession();
      const isLoggedIn = await isAuthenticated();
      
      if (!isLoggedIn) {
        return {
          success: false,
          error: "Nie znaleziono danych użytkownika. Proszę zalogować się ponownie.",
        };
      }
      
      // Pobierz dane użytkownika
      const { data: userData } = await supabaseClient.auth.getUser();
      const userEmail = userData.user?.email;

      if (!userEmail) {
        return {
          success: false,
          error: "Nie znaleziono danych użytkownika. Proszę zalogować się ponownie.",
        };
      }

      // Verify current password by attempting to sign in
      const { error: signInError } = await supabaseClient.auth.signInWithPassword({
        email: userEmail,
        password: command.current_password,
      });

      if (signInError) {
        return {
          success: false,
          error: "Aktualne hasło jest niepoprawne.",
        };
      }

      // Update the password
      const { error } = await supabaseClient.auth.updateUser({
        password: command.new_password,
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
      };
    } catch (err) {
      console.error("Error changing password:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Wystąpił błąd podczas zmiany hasła.",
      };
    }
  };

  /**
   * Deletes the user account
   * @param command Optional command containing password for verification
   * @returns Result object with success flag and optional error message
   */
  const deleteAccount = async (command?: DeleteAccountCommand) => {
    try {
      // Próba usunięcia konta przez endpoint API
      if (command?.password) {
        try {
          const response = await fetch("/api/auth/delete-account", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ password: command.password }),
          });

          const result = await response.json();

          if (response.ok) {
            return { success: true };
          } else {
            return {
              success: false,
              error: result.error || "Wystąpił błąd podczas usuwania konta",
            };
          }
        } catch (apiError) {
          console.error("API error, falling back to direct Supabase call:", apiError);
          // Jeśli endpoint API nie zadziała, używamy bezpośredniego wywołania Supabase
        }
      }

      // Bezpośrednie wywołanie Supabase - mechanizm awaryjny
      // Sprawdź czy użytkownik jest zalogowany
      await supabaseClient.auth.getSession();
      const isLoggedIn = await isAuthenticated();
      
      if (!isLoggedIn) {
        return {
          success: false,
          error: "Użytkownik nie jest zalogowany.",
        };
      }

      // If password is provided, verify it first
      if (command?.password) {
        // Pobierz dane użytkownika
        const { data: userData } = await supabaseClient.auth.getUser();
        const userEmail = userData.user?.email;
        
        if (!userEmail) {
          return {
            success: false, 
            error: "Nie znaleziono danych użytkownika."
          };
        }

        const { error: signInError } = await supabaseClient.auth.signInWithPassword({
          email: userEmail,
          password: command.password,
        });

        if (signInError) {
          return {
            success: false,
            error: "Podane hasło jest niepoprawne.",
          };
        }
      }

      // Get user ID for deletion
      const { data: userData } = await supabaseClient.auth.getUser();
      if (!userData.user) {
        return {
          success: false,
          error: "Nie znaleziono danych użytkownika.",
        };
      }

      // Delete the user account
      const { error } = await supabaseClient.auth.admin.deleteUser(userData.user.id);

      if (error) {
        throw error;
      }

      // Sign out the user after successful deletion
      await supabaseClient.auth.signOut();

      return {
        success: true,
      };
    } catch (err) {
      console.error("Error deleting account:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Wystąpił błąd podczas usuwania konta.",
      };
    }
  };

  return {
    changePassword,
    deleteAccount,
  };
}
