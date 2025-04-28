import type { APIRoute } from "astro";
import { flashcardService } from "../../lib/services/flashcardService";

export const GET: APIRoute = async () => {
  try {
    const categories = await flashcardService.getCategories();

    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return new Response(JSON.stringify({ error: "Nie udało się pobrać kategorii" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
