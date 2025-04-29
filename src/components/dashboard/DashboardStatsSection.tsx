import React, { useEffect, useState } from "react";
import DashboardStatsCard from "./DashboardStatsCard";

const DashboardStatsSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Symulacja ładowania danych
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-zinc-800/50 animate-pulse rounded-lg border border-zinc-800/50"></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-5 text-white">Statystyki</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardStatsCard
          title="Fiszki łącznie"
          value="345"
          trend={5}
          icon={<span>📚</span>}
          onClick={() => console.log("Clicked on flashcards stat")}
        />
        <DashboardStatsCard
          title="Sesje nauki"
          value="28"
          trend={12}
          icon={<span>🧠</span>}
        />
        <DashboardStatsCard
          title="Najlepszy wynik"
          value="92%"
          icon={<span>🏆</span>}
        />
        <DashboardStatsCard
          title="Skuteczność nauki"
          value="78%"
          trend={-3}
          icon={<span>📈</span>}
        />
      </div>
    </div>
  );
};

export default DashboardStatsSection;
