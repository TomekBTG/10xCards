import { supabaseClient } from "../../db/supabase.client";

/**
 * Wylogowuje użytkownika z aplikacji
 * @returns Promise<void>
 */
export const signOut = async (): Promise<void> => {
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    throw error;
  }
};
