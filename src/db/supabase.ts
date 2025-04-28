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
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error during auth check:", error.message);
      return false;
    }

    // Wykrywanie środowiska: przeglądarka vs. serwer
    const isBrowser = typeof window !== "undefined";

    // W środowisku przeglądarki spróbujmy pobrać token z localStorage
    if (isBrowser) {
      console.log("Auth running in browser environment");

      // Sprawdź localStorage (gdzie Supabase przechowuje token)
      const storageKey = `sb-${supabaseUrl.split("//")[1].split(".")[0]}-auth-token`;
      const storedSession = localStorage.getItem(storageKey);

      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);
          console.log("Found session in localStorage:", !!sessionData);

          // Sprawdź czy token nie wygasł
          if (sessionData && sessionData.expires_at) {
            const expiresAt = sessionData.expires_at * 1000; // konwersja na milisekundy
            const now = Date.now();

            if (expiresAt > now) {
              return true;
            } else {
              console.log("Session expired:", new Date(expiresAt).toLocaleString());
            }
          }
        } catch (e) {
          console.error("Error parsing localStorage session:", e);
        }
      }
    } else {
      console.log("Auth running in server environment");
    }

    // Jako fallback, używamy standardowej metody
    return !!data.session && !!data.session.user && !!data.session.access_token;
  } catch (e) {
    console.error("Exception during auth check:", e);
    return false;
  }
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

  // Usuwanie ciasteczka z tokenem sesji (ustawianie wygasłej daty)
  if (typeof document !== "undefined") {
    const AUTH_COOKIE_NAME = "sb-auth-token";
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax;`;
    console.log("Usunięto ciasteczko z tokenem sesji");
  }
};
