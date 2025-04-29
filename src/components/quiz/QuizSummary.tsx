import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import type { QuizStatsVM } from "../../types";

interface QuizSummaryProps {
  stats: QuizStatsVM;
  onRestart: () => void;
}

const QuizSummary: React.FC<QuizSummaryProps> = ({ stats, onRestart }) => {
  // Format seconds to mm:ss
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Oblicz klasę dla procentu poprawnych odpowiedzi
  const getAccuracyColorClass = (percent: number): string => {
    if (percent >= 80) return "text-green-600 dark:text-green-400 font-bold";
    if (percent >= 60) return "text-blue-600 dark:text-blue-400 font-bold";
    return "text-red-600 dark:text-red-400 font-bold";
  };

  return (
    <Card className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      <CardHeader className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800">
        <CardTitle>Podsumowanie sesji powtórkowej</CardTitle>
      </CardHeader>

      <CardContent className="space-y-8 p-6">
        {/* Podstawowe statystyki */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-lg text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Całkowity czas</p>
            <p className="text-xl font-mono mt-1 text-gray-900 dark:text-gray-100">{formatTime(stats.durationSeconds)}</p>
          </div>

          <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-lg text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Liczba fiszek</p>
            <p className="text-xl font-semibold mt-1 text-gray-900 dark:text-gray-100">{stats.total}</p>
          </div>

          <div className="col-span-2 md:col-span-1 bg-gray-100 dark:bg-zinc-800 p-4 rounded-lg text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Dokładność</p>
            <p className={`text-xl mt-1 ${getAccuracyColorClass(stats.percentCorrect)}`}>{stats.percentCorrect}%</p>
          </div>
        </div>

        {/* Wykres poprawnych i niepoprawnych odpowiedzi */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Szczegóły odpowiedzi</h3>

          <div className="flex items-center gap-4 mb-2">
            <div className="h-8 bg-green-100 dark:bg-green-900/30 rounded flex-1 overflow-hidden relative">
              <div
                className="h-full bg-green-500 dark:bg-green-600 flex items-center justify-center"
                style={{ width: `${stats.percentCorrect}%` }}
              >
                <span className="text-xs text-white font-semibold z-10">{stats.correctCount}</span>
              </div>
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-green-700 dark:text-green-300 font-semibold">
                Poprawne
              </span>
            </div>
            <div className="text-sm font-semibold text-green-600 dark:text-green-400">{stats.percentCorrect}%</div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-8 bg-red-100 dark:bg-red-900/30 rounded flex-1 overflow-hidden relative">
              <div
                className="h-full bg-red-500 dark:bg-red-600 flex items-center justify-center"
                style={{ width: `${100 - stats.percentCorrect}%` }}
              >
                <span className="text-xs text-white font-semibold z-10">{stats.incorrectCount}</span>
              </div>
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-red-700 dark:text-red-300 font-semibold">
                Niepoprawne
              </span>
            </div>
            <div className="text-sm font-semibold text-red-600 dark:text-red-400">{100 - stats.percentCorrect}%</div>
          </div>
        </div>

        {/* Statystyki dla kategorii, jeśli są dostępne */}
        {stats.categories && Object.keys(stats.categories).length > 0 && (
          <div>
            <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-gray-100">Wyniki według kategorii</h3>
            <div className="space-y-3">
              {Object.entries(stats.categories).map(([categoryId, percentage]) => (
                <div key={categoryId} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Kategoria {categoryId}</span>
                    <span className={getAccuracyColorClass(percentage)}>{percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${percentage >= 80 ? "bg-green-500 dark:bg-green-600" : percentage >= 60 ? "bg-blue-500 dark:bg-blue-600" : "bg-red-500 dark:bg-red-600"}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-3 justify-end border-t border-gray-200 dark:border-zinc-800 p-6">
        <Button onClick={() => (window.location.href = "/")} variant="outline" className="w-full sm:w-auto border-gray-300 dark:border-zinc-700">
          Powrót do pulpitu
        </Button>
        <Button onClick={onRestart} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
          Rozpocznij ponownie
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizSummary;
