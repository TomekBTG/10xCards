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

export const prerender = false;

// Stały identyfikator użytkownika do testów
const DEFAULT_USER_ID = "e12c2a37-0b49-4258-bebb-6076ddeceeb4";

// Schema for validating input
const generateFlashcardsSchema = z.object({
  user_input: z
    .string()
    .min(500, "Tekst musi zawierać przynajmniej 500 znaków")
    .max(10000, "Tekst nie może przekraczać 10000 znaków")
    .refine((text) => text.trim().length > 0, { message: "Tekst nie może być pusty" }),
});

export async function POST({ request }: APIContext): Promise<Response> {
  try {
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

    const { user_input } = validationResult.data as GenerateFlashcardsCommand;

    // 3. Wygeneruj fiszki przy użyciu serwisu AI
    const generatedFlashcards = await aiService.generateFlashcards(user_input);

    // 4. Przygotuj dane do zapisu w bazie danych
    const flashcardsToInsert = generatedFlashcards.map((flashcard) => ({
      user_id: DEFAULT_USER_ID,
      front: flashcard.front || "",
      back: flashcard.back || "",
      status: flashcard.status || "pending",
      is_ai_generated: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    console.log(flashcardsToInsert);

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

    // 6. Utwórz log generacji
    const generationLog = {
      user_id: DEFAULT_USER_ID,
      user_input: user_input,
      number_generated: insertedFlashcards.length,
      number_accepted: 0, // Na początku wszystkie mają status "pending"
      number_rejected: 0,
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

    // 7. Przygotuj odpowiedź
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
