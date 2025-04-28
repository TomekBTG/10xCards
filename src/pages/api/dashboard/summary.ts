import type { APIRoute } from "astro";
import { z } from "zod";
import type { DashboardSummaryDTO } from "@/types/dashboard";

// Schema walidacji zapytania
const querySchema = z.object({
  userId: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 5)),
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
    const limit = queryResult.data.limit;

    // if (!userId) {
    //   return new Response(
    //     JSON.stringify({ error: "Nieautoryzowany dostęp. Zaloguj się, aby uzyskać podsumowanie." }),
    //     { status: 401, headers: { "Content-Type": "application/json" } }
    //   );
    // }

    // UWAGA: W wersji produkcyjnej ten kod powinien być odkomentowany
    // Tymczasowo ignorujemy autoryzację dla celów rozwojowych

    // Przykładowe dane podsumowania
    const summary: DashboardSummaryDTO = {
      recentGenerations: [
        { id: "gen1", date: "2023-10-01", count: 15 },
        { id: "gen2", date: "2023-10-03", count: 8 },
        { id: "gen3", date: "2023-10-05", count: 12 },
        { id: "gen4", date: "2023-10-08", count: 20 },
        { id: "gen5", date: "2023-10-10", count: 5 },
      ].slice(0, limit),
    };

    // Zwróć dane
    return new Response(JSON.stringify({ data: summary }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Błąd podczas pobierania podsumowania dashboardu:", error);

    return new Response(JSON.stringify({ error: "Wystąpił błąd podczas pobierania podsumowania" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// Wyłączenie prerenderowania dla API
export const prerender = false;
