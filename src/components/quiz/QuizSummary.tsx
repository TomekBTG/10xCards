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
    if (percent >= 80) return "text-success font-bold";
    if (percent >= 60) return "text-primary font-bold";
    return "text-destructive font-bold";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Podsumowanie sesji powtórkowej</CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Podstawowe statystyki */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-muted-foreground text-sm">Całkowity czas</p>
            <p className="text-xl font-mono mt-1">{formatTime(stats.durationSeconds)}</p>
          </div>

          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-muted-foreground text-sm">Liczba fiszek</p>
            <p className="text-xl font-semibold mt-1">{stats.total}</p>
          </div>

          <div className="col-span-2 md:col-span-1 bg-muted p-4 rounded-lg text-center">
            <p className="text-muted-foreground text-sm">Dokładność</p>
            <p className={`text-xl mt-1 ${getAccuracyColorClass(stats.percentCorrect)}`}>{stats.percentCorrect}%</p>
          </div>
        </div>

        {/* Wykres poprawnych i niepoprawnych odpowiedzi */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold">Szczegóły odpowiedzi</h3>

          <div className="flex items-center gap-4 mb-2">
            <div className="h-8 bg-success/20 rounded flex-1 overflow-hidden relative">
              <div
                className="h-full bg-success flex items-center justify-center"
                style={{ width: `${stats.percentCorrect}%` }}
              >
                <span className="text-xs text-success-foreground font-semibold z-10">{stats.correctCount}</span>
              </div>
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-success font-semibold">
                Poprawne
              </span>
            </div>
            <div className="text-sm font-semibold text-success">{stats.percentCorrect}%</div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-8 bg-destructive/20 rounded flex-1 overflow-hidden relative">
              <div
                className="h-full bg-destructive flex items-center justify-center"
                style={{ width: `${100 - stats.percentCorrect}%` }}
              >
                <span className="text-xs text-destructive-foreground font-semibold z-10">{stats.incorrectCount}</span>
              </div>
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-destructive font-semibold">
                Niepoprawne
              </span>
            </div>
            <div className="text-sm font-semibold text-destructive">{100 - stats.percentCorrect}%</div>
          </div>
        </div>

        {/* Statystyki dla kategorii, jeśli są dostępne */}
        {stats.categories && Object.keys(stats.categories).length > 0 && (
          <div>
            <h3 className="text-base font-semibold mb-3">Wyniki według kategorii</h3>
            <div className="space-y-3">
              {Object.entries(stats.categories).map(([categoryId, percentage]) => (
                <div key={categoryId} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Kategoria {categoryId}</span>
                    <span className={getAccuracyColorClass(percentage)}>{percentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${percentage >= 80 ? "bg-success" : percentage >= 60 ? "bg-primary" : "bg-destructive"}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={onRestart} size="lg" className="w-full sm:w-auto">
          Rozpocznij ponownie
        </Button>
        <Button onClick={() => (window.location.href = "/")} variant="outline" size="lg" className="w-full sm:w-auto">
          Powrót do pulpitu
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizSummary;
