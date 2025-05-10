import { defineMiddleware } from "astro:middleware";
import { supabaseClient } from "@/db/supabase.client";
import "../polyfills";

// Lista ścieżek wymagających autoryzacji
// Tymczasowo usunąłem "/dashboard" z listy chronionych ścieżek
const PROTECTED_ROUTES = ["/flashcards", "/profile", "/settings", "/dashboard", "/generate", "/library"];

// Lista ścieżek dostępnych tylko dla niezalogowanych użytkowników
const GUEST_ONLY_ROUTES = ["/login", "/register", "/reset-password"];

// Nazwa ciasteczka sesji Supabase
const AUTH_COOKIE_NAME = "sb-auth-token";

export const onRequest = defineMiddleware(async ({ locals, url, cookies, redirect }, next) => {
  const pathname = url.pathname;

  try {
    // Inicjalizacja klienta Supabase w kontekście lokalnym
    // @ts-expect-error - dodajemy własność supabase do obiektu locals
    locals.supabase = supabaseClient;

    // Ustawienie tokena sesji z ciasteczka, jeśli istnieje
    const authCookie = cookies.get(AUTH_COOKIE_NAME);

    if (authCookie && authCookie.value) {
      try {
        // Sprawdź, czy token jest poprawnym JSON
        const tokenData = JSON.parse(authCookie.value);

        if (tokenData && tokenData.access_token) {
          // Ustaw token sesji w kliencie Supabase
          const { error } = await supabaseClient.auth.setSession({
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
          });

          if (error) {
            console.error("Błąd przy ustawianiu sesji:", error.message);
          }
        }
      } catch (e) {
        console.error("Błąd przy parsowaniu tokena sesji:", e);
      }
    }

    // Sprawdź, czy użytkownik jest zalogowany
    const { data } = await supabaseClient.auth.getSession();
    const isUserAuthenticated = !!data.session;

    // Ustaw stan autoryzacji w lokalnym kontekście Astro używając type assertion
    // @ts-expect-error - dodajemy własność isAuthenticated do obiektu locals
    locals.isAuthenticated = isUserAuthenticated;

    // Jeśli użytkownik próbuje uzyskać dostęp do chronionej ścieżki, ale nie jest zalogowany
    if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) && !isUserAuthenticated) {
      return redirect("/login");
    }

    // Jeśli użytkownik jest zalogowany, ale próbuje uzyskać dostęp do ścieżek tylko dla gości
    if (GUEST_ONLY_ROUTES.some((route) => pathname.startsWith(route)) && isUserAuthenticated) {
      return redirect("/dashboard");
    }

    // Kontynuuj obsługę żądania
    return await next();
  } catch (error) {
    console.error("Błąd middleware autoryzacji:", error);

    // W przypadku błędu, kontynuuj normalne przetwarzanie (obsługa błędów zostanie wykonana w komponencie)
    return await next();
  }
});
