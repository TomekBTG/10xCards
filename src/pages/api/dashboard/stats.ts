import type { APIRoute } from "astro";
import { z } from "zod";
import type { DashboardStatsDTO } from "@/types/dashboard";

// Schema walidacji zapytania
const querySchema = z.object({
  userId: z.string().optional(),
});

export const GET: APIRoute = async ({ request }) => {
  try {
    // Pobierz parametry zapytania
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());

    // Walidacja parametrów
    const queryResult = querySchema.safeParse(params);
    if (!queryResult.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe parametry zapytania",
          details: queryResult.error.format(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Pobierz identyfikator użytkownika z ciasteczek lub parametrów
    // UWAGA: Tymczasowo komentujemy kod weryfikujący autoryzację
    // const userId = queryResult.data.userId || cookies.get("userId")?.value;

    // if (!userId) {
    //   return new Response(
    //     JSON.stringify({ error: "Nieautoryzowany dostęp. Zaloguj się, aby uzyskać statystyki." }),
    //     { status: 401, headers: { "Content-Type": "application/json" } }
    //   );
    // }

    // UWAGA: W wersji produkcyjnej ten kod powinien być odkomentowany
    // Tymczasowo ignorujemy autoryzację dla celów rozwojowych

    // Przykładowe statystyki
    const stats: DashboardStatsDTO[] = [
      { label: "Wygenerowane fiszki", value: 243, icon: "📝" },
      { label: "Zaakceptowane fiszki", value: 187, icon: "✅" },
      { label: "Odrzucone fiszki", value: 56, icon: "❌" },
      { label: "Sesje nauki", value: 12, icon: "🧠" },
    ];

    // Zwróć dane
    return new Response(JSON.stringify({ data: stats }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Błąd podczas pobierania statystyk dashboardu:", error);

    return new Response(JSON.stringify({ error: "Wystąpił błąd podczas pobierania statystyk" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// Wyłączenie prerenderowania dla API
export const prerender = false;
