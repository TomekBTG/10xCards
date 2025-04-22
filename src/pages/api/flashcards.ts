import type { APIRoute } from "astro";
import { supabase } from "../../db/client";
import type { NewFlashcard } from "../../db/types";

// GET /api/flashcards - Retrieve user's flashcards
export const GET: APIRoute = async () => {
  try {
    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const userId = session.user.id;

    // Query flashcards for the current user
    const { data, error } = await supabase
      .from("flashcards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching flashcards:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

// POST /api/flashcards - Create a new flashcard
export const POST: APIRoute = async ({ request }) => {
  try {
    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const userId = session.user.id;

    // Get request body
    const body = await request.json();

    // Validate request body
    if (!body.front || !body.back) {
      return new Response(JSON.stringify({ error: "Front and back are required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Create new flashcard
    const newFlashcard: NewFlashcard = {
      front: body.front,
      back: body.back,
      status: body.status || "pending",
      is_ai_generated: body.is_ai_generated || false,
      is_public: body.is_public || false,
      user_id: userId,
    };

    const { data, error } = await supabase.from("flashcards").insert(newFlashcard).select().single();

    if (error) {
      console.error("Error creating flashcard:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
