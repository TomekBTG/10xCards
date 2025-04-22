import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Create a single supabase client for interacting with your database
const supabaseUrl = import.meta.env.SUPABASE_URL as string;
const supabaseKey = import.meta.env.SUPABASE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials. Please check your .env file.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Helper function to get the current user
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Helper function to check if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

export default supabase;
