import { useState, useEffect } from "react";
import type { DashboardSummaryDTO } from "@/types/dashboard";

interface UseDashboardSummaryOptions {
  limit?: number;
}

export function useDashboardSummary(options: UseDashboardSummaryOptions = {}) {
  const [summary, setSummary] = useState<DashboardSummaryDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { limit = 5 } = options;

  async function fetchSummaryData() {
    setIsLoading(true);
    setError(null);
    try {
      // Pobieranie danych z API
      const url = new URL("/api/dashboard/summary", window.location.origin);
      if (limit) {
        url.searchParams.append("limit", limit.toString());
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Nie udało się pobrać podsumowania");
      }

      const data = await response.json();

      if (!data.data || !data.data.recentGenerations) {
        throw new Error("Nieprawidłowy format danych z API");
      }

      setSummary(data.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Błąd podczas pobierania podsumowania:", err);
      setError(err instanceof Error ? err.message : "Nie udało się pobrać danych podsumowania.");
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSummaryData();
  }, [limit]);

  const refreshSummary = () => {
    fetchSummaryData();
  };

  // Format daty w przyjazny sposób
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return {
    summary,
    isLoading,
    error,
    refreshSummary,
    formatDate,
  };
}
