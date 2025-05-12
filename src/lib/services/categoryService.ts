import { supabaseClient } from "../../db/supabase.client";
import type { FlashcardCategory } from "../../types";
import { v4 as uuidv4 } from "uuid";
import type { Database } from "../../db/database.types";

/**
 * Serwis do zarządzania kategoriami fiszek
 */
export const categoryService = {
  /**
   * Pobiera wszystkie kategorie użytkownika
   * @returns Lista kategorii
   */
  async getCategories(): Promise<FlashcardCategory[]> {
    try {
      // Pobierz dane użytkownika
      const { data: userData } = await supabaseClient.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        throw new Error("Nie znaleziono ID użytkownika. Proszę zalogować się ponownie.");
      }

      // Pobierz kategorie z bazy danych
      const { data: categoriesData, error } = await supabaseClient
        .from("categories")
        .select("id, name")
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      // Pobierz liczby fiszek dla każdej kategorii - alternatywne podejście
      const { data: flashcards, error: flashcardsError } = await supabaseClient
        .from("flashcards")
        .select("category_id")
        .eq("user_id", userId);

      if (flashcardsError) {
        console.error("Błąd podczas pobierania fiszek:", flashcardsError);
      }

      // Ręczne zliczanie fiszek po kategoriach
      const countMap = new Map<string, number>();

      if (flashcards) {
        flashcards.forEach((flashcard) => {
          if (flashcard.category_id) {
            const currentCount = countMap.get(flashcard.category_id) || 0;
            countMap.set(flashcard.category_id, currentCount + 1);
          }
        });
      }

      // Połącz dane kategorii z licznikami
      const categories: FlashcardCategory[] = (categoriesData || []).map((category) => ({
        id: category.id,
        name: category.name,
        count: countMap.get(category.id) || 0,
      }));

      return categories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },

  /**
   * Tworzy nową kategorię
   * @param name Nazwa kategorii
   * @returns Utworzona kategoria
   */
  async createCategory(name: string): Promise<FlashcardCategory | null> {
    try {
      // Pobierz dane użytkownika
      const { data: userData } = await supabaseClient.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        throw new Error("Nie znaleziono ID użytkownika. Proszę zalogować się ponownie.");
      }

      // Sprawdź czy kategoria o tej nazwie już istnieje
      const { data: existingCategoryData, error: existingError } = await supabaseClient
        .from("categories")
        .select("id, name")
        .eq("user_id", userId)
        .eq("name", name)
        .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existingCategoryData) {
        console.log("Kategoria o tej nazwie już istnieje:", existingCategoryData);
        return {
          id: existingCategoryData.id,
          name: existingCategoryData.name,
          count: 0,
        };
      }

      // Utwórz nową kategorię
      const newCategory: Database["public"]["Tables"]["categories"]["Insert"] = {
        id: uuidv4(),
        name,
        user_id: userId,
      };

      const { data: categoryData, error } = await supabaseClient
        .from("categories")
        .insert(newCategory)
        .select("id, name")
        .single();

      if (error) {
        throw error;
      }

      return {
        id: categoryData.id,
        name: categoryData.name,
        count: 0,
      };
    } catch (error) {
      console.error("Error creating category:", error);
      return null;
    }
  },

  /**
   * Pobiera lub tworzy kategorię
   * @param name Nazwa kategorii
   * @returns Pobrana lub utworzona kategoria
   */
  async getOrCreateCategory(name: string): Promise<FlashcardCategory | null> {
    try {
      // Pobierz dane użytkownika
      const { data: userData } = await supabaseClient.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        throw new Error("Nie znaleziono ID użytkownika. Proszę zalogować się ponownie.");
      }

      // Sprawdź czy kategoria o tej nazwie już istnieje
      const { data: existingCategoryData, error: existingError } = await supabaseClient
        .from("categories")
        .select("id, name")
        .eq("user_id", userId)
        .eq("name", name)
        .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existingCategoryData) {
        return {
          id: existingCategoryData.id,
          name: existingCategoryData.name,
          count: 0,
        };
      }

      // Utwórz nową kategorię
      return await this.createCategory(name);
    } catch (error) {
      console.error("Error getting or creating category:", error);
      return null;
    }
  },
};
