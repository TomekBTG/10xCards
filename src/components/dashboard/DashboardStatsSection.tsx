import React from "react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import DashboardStatsCard from "./DashboardStatsCard";
import { Button } from "@/components/ui/button";

// Zoptymalizowany komponent karty statystyk
const MemoizedDashboardStatsCard = React.memo(DashboardStatsCard);

function DashboardStatsSection() {
  const { stats, isLoading, error, refreshStats } = useDashboardStats();

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Statystyki</h2>
        <Button variant="outline" size="sm" onClick={refreshStats} disabled={isLoading}>
          {isLoading ? "Odświeżanie..." : "Odśwież"}
        </Button>
      </div>

      {error && <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-md animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.length === 0 ? (
            <p className="col-span-full text-center py-8 text-gray-500">Brak dostępnych statystyk</p>
          ) : (
            stats.map((stat, index) => <MemoizedDashboardStatsCard key={stat.label + index} stat={stat} />)
          )}
        </div>
      )}
    </section>
  );
}

// Eksport komponentu z memoizacją
export default React.memo(DashboardStatsSection);
