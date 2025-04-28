import { toast } from "sonner";

/**
 * Custom hook for managing toast notifications
 * @returns Object with methods to show different types of toast notifications
 */
export function useToast() {
  return {
    /**
     * Shows a success toast notification
     * @param message Message to display in toast
     */
    success: (message: string) => {
      toast.success(message);
    },

    /**
     * Shows an error toast notification
     * @param message Message to display in toast
     */
    error: (message: string) => {
      toast.error(message);
    },

    /**
     * Shows an info toast notification
     * @param message Message to display in toast
     */
    info: (message: string) => {
      toast.info(message);
    },

    /**
     * Shows a warning toast notification
     * @param message Message to display in toast
     */
    warning: (message: string) => {
      toast.warning(message);
    },
  };
}
