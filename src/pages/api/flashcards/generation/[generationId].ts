import { z } from "zod";
import type { APIRoute } from "astro";
import type { FlashcardDTO, FlashcardGenerationLogDTO } from "../../../../types";
import { ignoreAuth } from "../../../../lib/auth";

export const GET: APIRoute = async ({ params, locals }) => {
  // Check user authentication using Supabase's getUser()
  const {
    data: { user },
  } = await locals.supabase.auth.getUser();
  if (!user && !ignoreAuth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Validate the generationId parameter from route parameters
  const generationIdSchema = z.string({ required_error: "generationId is required" });
  const parsedGenerationId = generationIdSchema.safeParse(params.generationId);
  if (!parsedGenerationId.success) {
    return new Response(
      JSON.stringify({ error: "Invalid generationId parameter", details: parsedGenerationId.error.issues }),
      { status: 400 }
    );
  }

  const generationId = parsedGenerationId.data;
  console.log("Fetching flashcards for generationId:", generationId);

  try {
    // TODO: Implement business logic to fetch flashcards and generation log by generationId using service layer
    // Placeholder response: currently returning empty array for flashcards and a simulated generation log
    const flashcards: FlashcardDTO[] = [];
    // Simulated generation log, modify properties as per actual data structure
    const generation: FlashcardGenerationLogDTO = { id: generationId } as FlashcardGenerationLogDTO;

    const responsePayload = {
      data: flashcards,
      generation,
    };

    return new Response(JSON.stringify(responsePayload), { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/flashcards/generation/{generationId}:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};
