import { useEffect, useState } from "react";
import { supabaseClient } from "../db/supabase.client";

// Interfejs dla stanu uwierzytelniania
interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
}

// Interfejs dla propów komponentu
interface AuthStateProviderProps {
  initialServerState: boolean;
}

export function AuthStateProvider({ initialServerState }: AuthStateProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: initialServerState,
    isLoading: true,
  });

  useEffect(() => {
    // Po załadowaniu komponentu w przeglądarce, sprawdź stan uwierzytelniania
    const checkClientAuth = async () => {
      try {
        // Sprawdź sesję po stronie klienta
        const { data } = await supabaseClient.auth.getSession();
        const isLoggedIn = !!data.session;

        // Aktualizuj tylko jeśli stan się zmienił
        if (isLoggedIn !== authState.isLoggedIn) {
          console.log("Updating auth state from client:", isLoggedIn);

          // Aktualizuj UI na podstawie rzeczywistego stanu
          if (isLoggedIn) {
            // Jeśli użytkownik jest zalogowany, ale UI pokazuje, że nie jest
            document.querySelectorAll("[data-auth-logged-out]").forEach((el) => {
              el.setAttribute("style", "display: none;");
            });
            document.querySelectorAll("[data-auth-logged-in]").forEach((el) => {
              el.setAttribute("style", "display: block;");
            });
          } else {
            // Jeśli użytkownik jest wylogowany, ale UI pokazuje, że jest zalogowany
            document.querySelectorAll("[data-auth-logged-in]").forEach((el) => {
              el.setAttribute("style", "display: none;");
            });
            document.querySelectorAll("[data-auth-logged-out]").forEach((el) => {
              el.setAttribute("style", "display: block;");
            });
          }

          setAuthState({
            isLoggedIn,
            isLoading: false,
          });
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Error checking client auth:", error);
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    // Ustaw nasłuchiwanie na zmiany stanu uwierzytelniania
    const { data: authListener } = supabaseClient.auth.onAuthStateChange((event, session) => {
      const isLoggedIn = !!session;

      setAuthState({
        isLoggedIn,
        isLoading: false,
      });

      // Aktualizuj UI
      if (isLoggedIn) {
        document.querySelectorAll("[data-auth-logged-out]").forEach((el) => {
          el.setAttribute("style", "display: none;");
        });
        document.querySelectorAll("[data-auth-logged-in]").forEach((el) => {
          el.setAttribute("style", "display: block;");
        });
      } else {
        document.querySelectorAll("[data-auth-logged-in]").forEach((el) => {
          el.setAttribute("style", "display: none;");
        });
        document.querySelectorAll("[data-auth-logged-out]").forEach((el) => {
          el.setAttribute("style", "display: block;");
        });
      }
    });

    // Sprawdź stan uwierzytelniania po załadowaniu
    checkClientAuth();

    // Wyczyść nasłuchiwanie po odmontowaniu komponentu
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [authState.isLoggedIn]);

  // Nie renderuj nic - to jest tylko dostawca stanu
  return null;
}

export default AuthStateProvider;
