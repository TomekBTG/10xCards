import React, { useEffect, useState } from "react";
import DashboardStatsCard from "./DashboardStatsCard";
import { supabaseClient } from "../../db/supabase.client";

interface UserStats {
  totalFlashcards: number;
  totalSessions: number;
  bestScore: number;
  learningEfficiency: number;
  flashcardsTrend: number | undefined;
  sessionsTrend: number | undefined;
  efficiencyTrend: number | undefined;
}

interface QuizResult {
  id: string;
  percent_correct: number;
  correct_count: number;
  total_cards: number;
}

const DashboardStatsSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    totalFlashcards: 0,
    totalSessions: 0,
    bestScore: 0,
    learningEfficiency: 0,
    flashcardsTrend: undefined,
    sessionsTrend: undefined,
    efficiencyTrend: undefined,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("StatsSection: Próba pobrania danych statystyk...");

        // Pobieramy ID zalogowanego użytkownika
        const { data: authData, error: authError } = await supabaseClient.auth.getUser();

        if (authError) {
          console.error("StatsSection: Błąd autoryzacji:", authError);
          throw new Error(`Błąd autoryzacji: ${authError.message}`);
        }

        if (!authData.user) {
          console.warn("StatsSection: Brak zalogowanego użytkownika");
          throw new Error("Użytkownik nie zalogowany");
        }

        console.log("StatsSection: Użytkownik zalogowany, ID:", authData.user.id);

        // Pobieramy wszystkie fiszki użytkownika
        const { data: flashcards, error: flashcardsError } = await supabaseClient
          .from("flashcards")
          .select("id")
          .eq("user_id", authData.user.id);

        if (flashcardsError) {
          console.error("StatsSection: Błąd pobierania fiszek:", flashcardsError);
          throw flashcardsError;
        }

        console.log("StatsSection: Pobrano fiszek:", flashcards?.length || 0);

        // Pobieramy wszystkie sesje quizów użytkownika
        const { data: quizResults, error: resultsError } = await supabaseClient
          .from("quiz_results")
          .select("id, percent_correct, correct_count, total_cards")
          .eq("user_id", authData.user.id);

        if (resultsError) {
          console.error("StatsSection: Błąd pobierania wyników quizów:", resultsError);
          throw resultsError;
        }

        console.log("StatsSection: Pobrano wyników quizów:", quizResults?.length || 0);

        // Obliczamy statystyki
        const totalFlashcards = flashcards?.length || 0;
        const totalSessions = quizResults?.length || 0;

        // Zmienne trendów - ustawiamy je na undefined jeśli nie ma historii
        let flashcardsTrend: number | undefined = undefined;
        let sessionsTrend: number | undefined = undefined;
        let efficiencyTrend: number | undefined = undefined;

        // Jeśli są sesje, znajdź najlepszy wynik
        let bestScore = 0;
        let totalCorrect = 0;
        let totalAnswers = 0;

        if (quizResults && quizResults.length > 0) {
          console.log("StatsSection: Analizowanie wyników quizów...");

          (quizResults as QuizResult[]).forEach((result) => {
            console.log(
              "StatsSection: Wynik -",
              "punkty:",
              result.correct_count,
              "/",
              result.total_cards,
              "procent:",
              result.percent_correct,
              "%"
            );

            bestScore = Math.max(bestScore, result.percent_correct);

            totalCorrect += result.correct_count;
            totalAnswers += result.total_cards;
          });

          console.log("StatsSection: Najlepszy wynik:", bestScore, "%");
          console.log("StatsSection: Poprawne odpowiedzi:", totalCorrect, "z", totalAnswers);

          // Tylko jeśli użytkownik ma historię quizów, to możemy pokazać trendy
          // W przyszłości należy je obliczać na podstawie danych historycznych
          if (totalSessions > 0) {
            flashcardsTrend = 5;
            sessionsTrend = 12;
            efficiencyTrend = -3;
          }
        } else {
          console.log("StatsSection: Brak wyników quizów do analizy");
        }

        // Obliczanie skuteczności nauki
        const learningEfficiency = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

        console.log("StatsSection: Skuteczność nauki:", learningEfficiency, "%");

        // Ustawienie statystyk
        setStats({
          totalFlashcards,
          totalSessions,
          bestScore,
          learningEfficiency,
          flashcardsTrend,
          sessionsTrend,
          efficiencyTrend,
        });
      } catch (error) {
        console.error("StatsSection: Błąd podczas pobierania statystyk:", error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Nieznany błąd");
        }

        // Ustawienie zerowych statystyk w przypadku błędu
        setStats({
          totalFlashcards: 0,
          totalSessions: 0,
          bestScore: 0,
          learningEfficiency: 0,
          flashcardsTrend: undefined,
          sessionsTrend: undefined,
          efficiencyTrend: undefined,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-5 text-white">Statystyki</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-800/50 animate-pulse rounded-lg border border-zinc-800/50"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-5 text-white">Statystyki</h2>
        <div className="p-4 border border-red-500/20 bg-red-900/10 rounded-md text-red-400 mb-4">
          <p>Błąd podczas ładowania statystyk: {error}</p>
          <p className="mt-2 text-sm">Sprawdź konsolę przeglądarki, aby zobaczyć szczegóły błędu.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <DashboardStatsCard title="Fiszki łącznie" value="0" icon={<span>📚</span>} />
          <DashboardStatsCard title="Sesje nauki" value="0" icon={<span>🧠</span>} />
          <DashboardStatsCard title="Najlepszy wynik" value="0%" icon={<span>🏆</span>} />
          <DashboardStatsCard title="Skuteczność nauki" value="0%" icon={<span>📈</span>} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-5 text-white">Statystyki</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardStatsCard
          title="Fiszki łącznie"
          value={stats.totalFlashcards.toString()}
          trend={stats.flashcardsTrend}
          icon={<span>📚</span>}
        />
        <DashboardStatsCard
          title="Sesje nauki"
          value={stats.totalSessions.toString()}
          trend={stats.sessionsTrend}
          icon={<span>🧠</span>}
        />
        <DashboardStatsCard title="Najlepszy wynik" value={`${stats.bestScore}%`} icon={<span>🏆</span>} />
        <DashboardStatsCard
          title="Skuteczność nauki"
          value={`${stats.learningEfficiency}%`}
          trend={stats.efficiencyTrend}
          icon={<span>📈</span>}
        />
      </div>
    </div>
  );
};

export default DashboardStatsSection;
