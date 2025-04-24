import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Pobierz zmienne środowiskowe
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_KEY;

// Utwórz klienta Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Sprawdza, czy użytkownik jest zalogowany
 * @returns Promise<boolean> - true jeśli użytkownik jest zalogowany, false w przeciwnym razie
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session !== null;
};

/**
 * Pobiera aktualnie zalogowanego użytkownika
 * @returns Promise<User | null> - obiekt użytkownika lub null, jeśli nie jest zalogowany
 */
export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

/**
 * Wylogowuje użytkownika
 * @returns Promise<void>
 */
export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut();
};
