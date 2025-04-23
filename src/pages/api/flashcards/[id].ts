import { z } from "zod";
import type { APIRoute } from "astro";
import type { FlashcardDTO } from "../../../types";
import { getFlashcardById } from "../../../lib/flashcardService";
import { ignoreAuth } from "../../../lib/auth";

// export const GET: APIRoute = async ({ params, locals }) => {
export const GET: APIRoute = async ({ params, locals }) => {
  // Check user authentication using Supabase's getUser()
  const {
    data: { user },
  } = await locals.supabase.auth.getUser();
  if (!user && !ignoreAuth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Validate the id parameter from route parameters
  const idSchema = z.string({ required_error: "id is required" });
  const parsedId = idSchema.safeParse(params.id);
  if (!parsedId.success) {
    return new Response(JSON.stringify({ error: "Invalid id parameter", details: parsedId.error.issues }), {
      status: 400,
    });
  }

  const id = parsedId.data;
  // Use id so that linter does not flag it as unused
  console.log("Fetching flashcard with id:", id);

  try {
    const flashcard: FlashcardDTO | null = await getFlashcardById({ id, supabase: locals.supabase });

    if (!flashcard) {
      return new Response(JSON.stringify({ error: "Flashcard not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(flashcard), { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/flashcards/{id}:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};

// ------------------ PATCH Endpoint (Update Flashcard) ------------------
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  // Check user authentication using Supabase's getUser()
  const {
    data: { user },
  } = await locals.supabase.auth.getUser();
  if (!user && !ignoreAuth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Validate the id parameter
  const idSchema = z.string({ required_error: "id is required" });
  const parsedId = idSchema.safeParse(params.id);
  if (!parsedId.success) {
    return new Response(JSON.stringify({ error: "Invalid id parameter", details: parsedId.error.issues }), {
      status: 400,
    });
  }
  const id = parsedId.data;

  // Parse and validate request body
  let bodyData: unknown;
  try {
    bodyData = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const updateSchema = z.object({
    front: z.string().max(200, { message: "front cannot be longer than 200 characters" }),
    back: z.string().max(500, { message: "back cannot be longer than 500 characters" }),
    status: z.enum(["accepted", "rejected", "pending"]),
  });

  const parsedBody = updateSchema.safeParse(bodyData);
  if (!parsedBody.success) {
    return new Response(JSON.stringify({ error: "Invalid request body", details: parsedBody.error.issues }), {
      status: 400,
    });
  }
  const updateData = parsedBody.data;

  try {
    // TODO: Implement business logic to update flashcard using service layer
    // Simulated updated flashcard response
    const updatedFlashcard = { id, ...updateData };
    return new Response(JSON.stringify(updatedFlashcard), { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/flashcards/{id}:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};

// ------------------ DELETE Endpoint (Delete Flashcard) ------------------
export const DELETE: APIRoute = async ({ params, locals }) => {
  // Check user authentication using Supabase's getUser()
  const {
    data: { user },
  } = await locals.supabase.auth.getUser();
  if (!user && !ignoreAuth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Validate the id parameter
  const idSchema = z.string({ required_error: "id is required" });
  const parsedId = idSchema.safeParse(params.id);
  if (!parsedId.success) {
    return new Response(JSON.stringify({ error: "Invalid id parameter", details: parsedId.error.issues }), {
      status: 400,
    });
  }
  const id = parsedId.data;
  console.log("Deleting flashcard with id:", id);

  try {
    // TODO: Implement business logic to delete the flashcard using service layer
    // Simulated deletion response
    return new Response(JSON.stringify({ message: "Flashcard deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/flashcards/{id}:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};
