import React, { useEffect, useState } from "react";
import { formatTime } from "../lib/services/quizService";
import { quizResultsService, type QuizResultDTO } from "../lib/services/quizResultsService";
import { supabaseClient } from "../db/supabase.client";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface QuizResultsTableProps {
  limit?: number;
}

export function QuizResultsTable({ limit = 5 }: QuizResultsTableProps) {
  const [results, setResults] = useState<QuizResultDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        setIsLoading(true);
        const data = await quizResultsService.getQuizResultsHistory(supabaseClient, limit);
        setResults(data);
      } catch (err) {
        setError("Nie udało się pobrać historii wyników quizu");
        console.error("Error fetching quiz results:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [limit]);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (isLoading) {
    return <div className="text-center py-4">Ładowanie historii wyników...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  if (results.length === 0) {
    return <div className="text-center py-4">Brak historii wyników quizu</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historia wyników quizu</CardTitle>
        <CardDescription>Twoje ostatnie {limit} sesji quizowych</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Lista ostatnich wyników quizu</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Kategoria</TableHead>
              <TableHead>Poziom</TableHead>
              <TableHead>Wynik</TableHead>
              <TableHead>Czas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.id}>
                <TableCell>{formatDate(result.created_at)}</TableCell>
                <TableCell>{result.category_id ? result.category_id : "Wszystkie"}</TableCell>
                <TableCell className="capitalize">{result.difficulty ? result.difficulty : "Wszystkie"}</TableCell>
                <TableCell>
                  <span className="font-medium">{result.percent_correct}%</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({result.correct_count}/{result.total_cards})
                  </span>
                </TableCell>
                <TableCell>{formatTime(result.duration_seconds)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
