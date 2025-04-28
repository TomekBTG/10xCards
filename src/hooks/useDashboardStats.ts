import { useState, useEffect } from "react";
import type { DashboardStatsDTO } from "@/types/dashboard";

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStatsDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchDashboardStats() {
    setIsLoading(true);
    setError(null);
    try {
      // Wywołanie prawdziwego API
      const response = await fetch("/api/dashboard/stats");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Nie udało się pobrać statystyk");
      }

      const data = await response.json();

      if (!data.data || !Array.isArray(data.data)) {
        throw new Error("Nieprawidłowy format danych z API");
      }

      setStats(data.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Błąd podczas pobierania statystyk dashboardu:", err);
      setError(err instanceof Error ? err.message : "Nie udało się pobrać statystyk. Spróbuj ponownie później.");
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const refreshStats = () => {
    fetchDashboardStats();
  };

  return { stats, isLoading, error, refreshStats };
}
