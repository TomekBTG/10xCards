import { defineMiddleware } from "astro:middleware";
import { isAuthenticated } from "@/db/supabase";

// Lista ścieżek wymagających autoryzacji
const PROTECTED_ROUTES = ["/dashboard", "/flashcards", "/profile", "/settings"];

// Lista ścieżek dostępnych tylko dla niezalogowanych użytkowników
const GUEST_ONLY_ROUTES = ["/login", "/register", "/reset-password"];

export const onRequest = defineMiddleware(async ({ locals, url, redirect }, next) => {
  const pathname = url.pathname;

  try {
    // Sprawdź, czy użytkownik jest zalogowany
    const isUserAuthenticated = await isAuthenticated();

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
