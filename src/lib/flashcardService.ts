import type { FlashcardDTO } from "../types";
import type { SupabaseClient } from "@supabase/supabase-js";

// Function to fetch a flashcard by id from the database using Supabase client
export async function getFlashcardById({
  id,
  supabase,
}: {
  id: string;
  supabase: SupabaseClient;
}): Promise<FlashcardDTO | null> {
  const { data, error } = await supabase.from("flashcards").select("*").eq("id", id).single();
  if (error) {
    // If the error indicates no rows found, return null
    if (error.message.toLowerCase().includes("no rows")) {
      return null;
    }
    throw error;
  }
  return data;
}
