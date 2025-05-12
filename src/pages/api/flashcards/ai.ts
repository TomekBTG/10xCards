import type { APIContext } from "astro";
import { z } from "zod";
import type {
  GenerateFlashcardsCommand,
  GenerateFlashcardsResponseDTO,
  FlashcardDTO,
  FlashcardGenerationLogDTO,
} from "../../../types";
import { aiService } from "../../../lib/services/ai.service";
import { supabaseClient } from "../../../db/supabase.client";
import { categoryService } from "../../../lib/services/categoryService";

export const prerender = false;

// Schema for validating input
const generateFlashcardsSchema = z.object({
  user_input: z
    .string()
    .min(500, "Tekst musi zawierać przynajmniej 500 znaków")
    .max(10000, "Tekst nie może przekraczać 10000 znaków")
    .refine((text) => text.trim().length > 0, { message: "Tekst nie może być pusty" }),
  category_id: z.string().optional(),
  category_name: z.string().optional(),
});

export async function POST({ request, locals }: APIContext): Promise<Response> {
  try {
    // Sprawdź uwierzytelnienie z middleware
    const isLoggedIn = "isAuthenticated" in locals ? (locals.isAuthenticated as boolean) : false;

    if (!isLoggedIn) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // 1. Pobierz i zwaliduj dane z żądania
    const body = await request.json();

    const validationResult = generateFlashcardsSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane wejściowe",
          details: validationResult.error.format(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Pobierz dane sesji użytkownika
    const { data } = await supabaseClient.auth.getSession();

    // Sprawdź czy użytkownik ma ważną sesję i ID
    if (!data.session || !data.session.user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized - brak ID użytkownika" }), { status: 401 });
    }

    const userId = data.session.user.id;
    const { user_input, category_id, category_name } = validationResult.data as GenerateFlashcardsCommand;

    // Obsługa kategorii - uzyskaj właściwe category_id
    let finalCategoryId: string;
    if (category_id) {
      // Używamy istniejącej kategorii
      finalCategoryId = category_id;
      console.log("Używamy istniejącej kategorii z ID:", category_id);
    } else if (category_name) {
      // Tworzymy lub pobieramy kategorię o podanej nazwie
      console.log("Szukamy lub tworzymy kategorię o nazwie:", category_name);
      const category = await categoryService.getOrCreateCategory(category_name);
      if (!category) {
        return new Response(JSON.stringify({ error: "Nie udało się utworzyć kategorii" }), { status: 500 });
      }
      finalCategoryId = category.id;
      console.log("Znaleziono/utworzono kategorię:", category.name, "z ID:", category.id);
    } else {
      // Jeśli nie ma kategorii, użyj domyślnej
      console.log("Brak kategorii - używamy domyślnej");
      const defaultCategory = await categoryService.getOrCreateCategory("Domyślna kategoria");
      if (!defaultCategory) {
        return new Response(JSON.stringify({ error: "Nie udało się utworzyć domyślnej kategorii" }), { status: 500 });
      }
      finalCategoryId = defaultCategory.id;
    }

    // 2. Wygeneruj fiszki przy użyciu serwisu AI
    const generatedFlashcards = await aiService.generateFlashcards(user_input, finalCategoryId, category_name);

    // 3. Utwórz log generacji
    const generationLog = {
      user_id: userId,
      user_input: user_input,
      number_generated: generatedFlashcards.length,
      generation_duration: 1, // Wartość przykładowa w sekundach
      generated_at: new Date().toISOString(),
    };

    const { data: insertedLog, error: logError } = await supabaseClient
      .from("flashcard_generation_logs")
      .insert(generationLog)
      .select("*")
      .single();

    if (logError) {
      console.error("Błąd podczas zapisywania logu generacji:", logError);
      return new Response(JSON.stringify({ error: "Błąd serwera podczas zapisywania logu generacji" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4. Przygotuj dane do zapisu w bazie danych
    const flashcardsToInsert = generatedFlashcards.map((flashcard) => ({
      user_id: userId,
      front: flashcard.front || "",
      back: flashcard.back || "",
      status: flashcard.status || "pending",
      is_ai_generated: true,
      flashcard_generation_logs_id: insertedLog.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category_id: finalCategoryId,
    }));

    // Logowanie danych dla debugowania
    console.log("Kategoria użyta do zapisu fiszek:", {
      category_id: finalCategoryId,
      original_category_id: category_id,
      original_category_name: category_name,
    });
    console.log("Przykładowa fiszka do zapisu:", flashcardsToInsert[0]);

    // 5. Zapisz fiszki w bazie danych
    const { data: insertedFlashcards, error: flashcardsError } = await supabaseClient
      .from("flashcards")
      .insert(flashcardsToInsert)
      .select("*");

    if (flashcardsError) {
      console.error("Błąd podczas zapisywania fiszek:", flashcardsError);
      return new Response(JSON.stringify({ error: "Błąd serwera podczas zapisywania fiszek" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 6. Przygotuj odpowiedź
    const response: GenerateFlashcardsResponseDTO = {
      flashcards: insertedFlashcards as FlashcardDTO[],
      log: insertedLog as FlashcardGenerationLogDTO,
    };

    return new Response(JSON.stringify(response), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Nieoczekiwany błąd podczas generowania fiszek:", error);
    return new Response(JSON.stringify({ error: "Wystąpił nieoczekiwany błąd" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
