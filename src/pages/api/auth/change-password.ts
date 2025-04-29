import type { APIRoute } from "astro";
import { supabaseClient } from "../../../db/supabase.client";
import { isAuthenticated } from "../../../db/supabase";
import type { UpdatePasswordCommand } from "../../../types/auth";
import { z } from "zod";

// Schemat walidacji dla zmiany hasła
const passwordChangeSchema = z
  .object({
    current_password: z.string().min(1, "Aktualne hasło jest wymagane"),
    new_password: z.string().min(8, "Nowe hasło musi mieć co najmniej 8 znaków"),
    confirm_password: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Hasła nie są identyczne",
    path: ["confirm_password"],
  });

export const POST: APIRoute = async ({ request }) => {
  try {
    // Pobierz dane z żądania
    const body = await request.json();

    // Walidacja danych wejściowych
    const validationResult = passwordChangeSchema.safeParse(body);
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

    const data = validationResult.data as UpdatePasswordCommand;

    // Pobierz informacje o sesji
    await supabaseClient.auth.getSession();
    // Wywołaj funkcję isAuthenticated
    const isLoggedIn = await isAuthenticated();

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
    
    if (!userEmail) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Brak adresu email w danych użytkownika",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Weryfikacja aktualnego hasła
    const { error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: userEmail,
      password: data.current_password,
    });

    if (signInError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Aktualne hasło jest niepoprawne",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Zmiana hasła
    const { error } = await supabaseClient.auth.updateUser({
      password: data.new_password,
    });

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

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in password change endpoint:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Wystąpił nieoczekiwany błąd podczas zmiany hasła",
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
