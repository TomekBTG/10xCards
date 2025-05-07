import type { APIRoute } from "astro";
import { supabaseClient } from "../../../db/supabase.client";
import { z } from "zod";

// Schemat walidacji dla usuwania konta
const deleteAccountSchema = z.object({
  password: z.string().min(1, "Hasło jest wymagane do potwierdzenia"),
});

export const DELETE: APIRoute = async ({ request, locals }) => {
  try {
    // Pobierz dane z żądania
    const body = await request.json();

    // Walidacja danych wejściowych
    const validationResult = deleteAccountSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: validationResult.error.errors[0].message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = validationResult.data as { password: string };

    // Sprawdź uwierzytelnienie z middleware
    const isLoggedIn = "isAuthenticated" in locals ? (locals.isAuthenticated as boolean) : false;

    if (!isLoggedIn) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Użytkownik nie jest zalogowany",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Pobierz dane użytkownika
    const { data: userData } = await supabaseClient.auth.getUser();
    const userEmail = userData.user?.email;
    const userId = userData.user?.id;

    if (!userEmail || !userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Nieprawidłowe dane użytkownika",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Weryfikacja hasła
    const { error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: userEmail,
      password: data.password,
    });

    if (signInError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Podane hasło jest niepoprawne",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Przed usunięciem konta możemy wykonać dodatkowe czyszczenie danych użytkownika
    // np. usunięcie rekordów z bazy danych powiązanych z użytkownikiem

    // Usunięcie konta
    const { error } = await supabaseClient.auth.admin.deleteUser(userId);

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Wylogowanie użytkownika
    await supabaseClient.auth.signOut();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in delete account endpoint:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Wystąpił nieoczekiwany błąd podczas usuwania konta",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// Wyłączenie prerenderowania
export const prerender = false;
