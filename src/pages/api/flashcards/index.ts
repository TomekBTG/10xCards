import { z } from "zod";
import type { APIRoute } from "astro";
import type { FlashcardsListResponseDTO, FlashcardDTO } from "../../../types";
import { ignoreAuth } from "../../../lib/auth";

export const GET: APIRoute = async ({ request, locals }) => {
  // Check user authentication using Supabase's getUser()
  const {
    data: { user },
  } = await locals.supabase.auth.getUser();
  if (!user && !ignoreAuth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Define schema for query parameters validation
  const querySchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.enum(["accepted", "rejected", "pending"]).optional(),
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _status = parsed.data.status; // TODO: implement filtering based on status in future
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _sort = parsed.data.sort || "created_at desc"; // TODO: implement sorting using _sort in future

  try {
    // TODO: Implement business logic to fetch flashcards using service layer
    // Currently returning an empty list as a placeholder
    const flashcards: FlashcardDTO[] = [];
    const total = 0;

    const responsePayload: FlashcardsListResponseDTO = {
      data: flashcards,
      pagination: { page, limit, total },
    };

    return new Response(JSON.stringify(responsePayload), { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/flashcards:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};

// ------------------ New POST Endpoint ------------------
export const POST: APIRoute = async ({ request, locals }) => {
  // Check user authentication using Supabase's getUser()
  const {
    data: { user },
  } = await locals.supabase.auth.getUser();
  if (!user && !ignoreAuth) {
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
    // TODO: Implement business logic to store flashcards using service layer
    // Simulated response: assuming all flashcards are successfully created
    const createdFlashcards = flashcardsData; // Replace with actual service call
    const responsePayload = {
      data: createdFlashcards,
      failed: [],
    };
    return new Response(JSON.stringify(responsePayload), { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/flashcards:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};
