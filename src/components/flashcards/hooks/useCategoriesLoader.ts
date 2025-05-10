import { useState, useEffect } from "react";
import type { FlashcardCategory } from "@/types";

/**
 * Hook do pobierania i zarządzania kategoriami
 * Pobiera kategorie z API i przechowuje je w stanie lokalnym
 */
export function useCategoriesLoader() {
  const [categories, setCategories] = useState<FlashcardCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Funkcja pobierająca kategorie z API
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("Pobieranie kategorii z API");
        const response = await fetch("/api/categories");

        if (!response.ok) {
          throw new Error("Nie udało się pobrać kategorii");
        }

        const data = await response.json();
        console.log("Pobrane kategorie:", data);
        setCategories(data);
      } catch (err) {
        console.error("Błąd podczas pobierania kategorii:", err);
        setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
      } finally {
        setIsLoading(false);
      }
    };

    // Pobierz kategorie przy montowaniu komponentu
    fetchCategories();
  }, []);

  return { categories, isLoading, error };
}
