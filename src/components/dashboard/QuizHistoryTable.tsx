import React, { useEffect, useState } from "react";
import { supabaseClient } from "../../db/supabase.client";

interface QuizResult {
  id: string;
  category_id: string | null;
  created_at: string;
  difficulty: string | null;
  correct_count: number;
  incorrect_count: number;
  total_cards: number;
  percent_correct: number;
  duration_seconds: number;
  category_stats: any;
}

interface CategoryInfo {
  id: string;
  name: string;
}

const QuizHistoryTable: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("Próba pobrania danych z Supabase...");

        // Pobieramy ID zalogowanego użytkownika
        const { data: authData, error: authError } = await supabaseClient.auth.getUser();

        if (authError) {
          console.error("Błąd autoryzacji:", authError);
          throw new Error(`Błąd autoryzacji: ${authError.message}`);
        }

        if (!authData.user) {
          console.warn("Brak zalogowanego użytkownika");
          throw new Error("Użytkownik nie zalogowany");
        }

        console.log("Użytkownik zalogowany, ID:", authData.user.id);

        // Pobieramy kategorie
        const { data: categoriesData, error: categoriesError } = await supabaseClient
          .from("categories")
          .select("id, name");

        if (categoriesError) {
          console.error("Błąd pobierania kategorii:", categoriesError);
        } else {
          // Tworzymy mapę ID kategorii -> nazwa
          const categoryMap: Record<string, string> = {};
          (categoriesData || []).forEach((cat: CategoryInfo) => {
            categoryMap[cat.id] = cat.name;
          });
          setCategories(categoryMap);
          console.log("Pobrano kategorie:", Object.keys(categoryMap).length);
        }

        // Pobieramy historię quizów z bazy danych
        const { data, error: queryError } = await supabaseClient
          .from("quiz_results")
          .select(
            `
            id,
            category_id,
            difficulty,
            correct_count,
            incorrect_count,
            total_cards,
            percent_correct,
            duration_seconds,
            created_at,
            category_stats
          `
          )
          .eq("user_id", authData.user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (queryError) {
          console.error("Błąd zapytania do bazy danych:", queryError);
          throw queryError;
        }

        console.log("Pobrano dane historii quizów:", data ? data.length : 0, "rekordów");

        // Ustawiamy puste dane gdy nie ma wyników
        setQuizHistory(data || []);
      } catch (error) {
        console.error("Błąd podczas pobierania historii quizów:", error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Nieznany błąd");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizHistory();
  }, []);

  // Funkcja formatująca czas trwania quizu
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Funkcja formatująca datę
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Funkcja pobierająca nazwę kategorii
  const getCategoryName = (categoryId: string | null): string => {
    if (!categoryId) return "Ogólny";
    return categories[categoryId] || "Nieznana kategoria";
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-5 text-white">Historia quizów</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-12 bg-zinc-800/50 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-5 text-white">Historia quizów</h2>
        <div className="p-4 border border-red-500/20 bg-red-900/10 rounded-md text-red-400">
          <p>Błąd podczas ładowania historii: {error}</p>
          <p className="mt-2 text-sm">Sprawdź konsolę przeglądarki, aby zobaczyć szczegóły błędu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-5 text-white">Historia quizów</h2>

      {quizHistory.length === 0 ? (
        <div className="p-4 bg-zinc-800/30 rounded-md text-zinc-400 text-center">
          <p>Nie masz jeszcze żadnej historii quizów</p>
          <p className="mt-2 text-sm">Ukończ quiz, aby zobaczyć tutaj swoje wyniki</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase text-zinc-400 border-b border-zinc-800">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Data
                </th>
                <th scope="col" className="px-4 py-3">
                  Kategoria
                </th>
                <th scope="col" className="px-4 py-3">
                  Wynik
                </th>
                <th scope="col" className="px-4 py-3">
                  Punkty
                </th>
                <th scope="col" className="px-4 py-3">
                  Czas
                </th>
              </tr>
            </thead>
            <tbody>
              {quizHistory.map((quiz) => (
                <tr key={quiz.id} className="border-b border-zinc-800 hover:bg-zinc-800/30">
                  <td className="px-4 py-3 text-white">{formatDate(quiz.created_at)}</td>
                  <td className="px-4 py-3 text-white">{getCategoryName(quiz.category_id)}</td>
                  <td className="px-4 py-3 text-white">{quiz.percent_correct}%</td>
                  <td className="px-4 py-3 text-white">
                    {quiz.correct_count}/{quiz.total_cards}
                  </td>
                  <td className="px-4 py-3 text-white">{formatDuration(quiz.duration_seconds || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuizHistoryTable;
