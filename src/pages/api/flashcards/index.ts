import { z } from "zod";
import type { APIRoute } from "astro";
import type { FlashcardsListResponseDTO } from "../../../types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../db/database.types";
import { flashcardService } from "../../../lib/services/flashcardService";

// Definicja interfejsu dla locals jeśli App.Locals nie jest rozpoznawany
interface LocalsWithSupabase {
  supabase: SupabaseClient<Database>;
}

// Tymczasowa wartość ignoreAuth
const ignoreAuth = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const supabase = (locals as LocalsWithSupabase).supabase;

  // Sprawdź uwierzytelnienie z middleware
  const isLoggedIn = 'isAuthenticated' in locals ? locals.isAuthenticated as boolean : false;

  if (!isLoggedIn && !ignoreAuth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Define schema for query parameters validation
  const querySchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.enum(["accepted", "rejected", "pending"]).optional(),
    categoryId: z.string().optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
    createdBefore: z.string().optional(),
    createdAfter: z.string().optional(),
    sort: z.string().optional(),
  });

  // Parse query parameters
  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams.entries());
  const parsed = querySchema.safeParse(queryParams);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid query parameters", details: parsed.error.issues }), {
      status: 400,
    });
  }

  // Establish parameter values with defaults
  const page = parsed.data.page ? parseInt(parsed.data.page) : 1;
  const limit = parsed.data.limit ? parseInt(parsed.data.limit) : 10;
  const offset = (page - 1) * limit;
  const status = parsed.data.status;
  const categoryId = parsed.data.categoryId;
  const difficulty = parsed.data.difficulty;
  const createdBefore = parsed.data.createdBefore;
  const createdAfter = parsed.data.createdAfter;
  const sort = parsed.data.sort || "created_at.desc";

  try {
    // Implementacja pobierania fiszek z Supabase
    let query = supabase.from("flashcards").select("*", { count: "exact" });

    // Zastosowanie filtrów
    if (status) {
      query = query.eq("status", status);
    }

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }

    if (createdBefore) {
      query = query.lte("created_at", createdBefore);
    }

    if (createdAfter) {
      query = query.gte("created_at", createdAfter);
    }

    // Zastosowanie sortowania
    const [sortField, sortOrder] = sort.split(".");
    if (sortField && sortOrder) {
      query = query.order(sortField, { ascending: sortOrder === "asc" });
    }

    // Zastosowanie paginacji
    query = query.range(offset, offset + limit - 1);

    // Wykonanie zapytania
    const { data: flashcards, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return new Response(JSON.stringify({ error: "Database error" }), { status: 500 });
    }

    const responsePayload: FlashcardsListResponseDTO = {
      data: flashcards || [],
      pagination: { page, limit, total: count || 0 },
    };

    return new Response(JSON.stringify(responsePayload), { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/flashcards:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};

// ------------------ New POST Endpoint ------------------
export const POST: APIRoute = async ({ request, locals }) => {
  const supabase = (locals as LocalsWithSupabase).supabase;

  // Sprawdź uwierzytelnienie z middleware
  const isLoggedIn = 'isAuthenticated' in locals ? locals.isAuthenticated as boolean : false;

  if (!isLoggedIn && !ignoreAuth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  let bodyData: unknown;
  try {
    bodyData = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  // Define schema for a single flashcard
  const flashcardSchema = z.object({
    front: z.string().max(200, { message: "front cannot be longer than 200 characters" }),
    back: z.string().max(500, { message: "back cannot be longer than 500 characters" }),
    is_ai_generated: z.boolean(),
    category_id: z.string().optional(),
    category_name: z.string().optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  });

  // Define schema for creating one or more flashcards
  const createFlashcardsSchema = z.object({
    flashcards: z.array(flashcardSchema),
  });

  const parsed = createFlashcardsSchema.safeParse(bodyData);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid request body", details: parsed.error.issues }), {
      status: 400,
    });
  }

  const flashcardsData = parsed.data.flashcards;

  try {
    // Pobierz ID aktualnego użytkownika
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && !ignoreAuth) {
      return new Response(JSON.stringify({ error: "Unauthorized - user not found" }), { status: 401 });
    }

    // Przygotuj fiszki do zapisania
    const preparedFlashcards = flashcardsData.map((flashcard) => ({
      ...flashcard,
      user_id: user?.id || "anonymous",
      status: "accepted", // domyślny status dla nowych fiszek
    }));

    // Zapisz fiszki używając serwisu
    const savedFlashcards = await flashcardService.saveFlashcards(preparedFlashcards);

    // Przygotuj odpowiedź
    const responsePayload = {
      data: savedFlashcards,
      failed: [], // Pusta tablica, jeśli wszystkie fiszki zostały pomyślnie zapisane
    };

    return new Response(JSON.stringify(responsePayload), { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/flashcards:", error);

    // Obsługa błędów - sprawdź czy error jest instancją Error
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";

    return new Response(
      JSON.stringify({
        error: errorMessage,
        failed: flashcardsData,
      }),
      { status: 500 }
    );
  }
};
