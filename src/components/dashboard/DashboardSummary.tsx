import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";

type SortDirection = "asc" | "desc";
type SortField = "date" | "count";

export default function DashboardSummary() {
  const [limit, setLimit] = useState<number>(5);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const { summary, isLoading, error, refreshSummary, formatDate } = useDashboardSummary({ limit });

  // Funkcja sortująca dane
  const getSortedGenerations = () => {
    if (!summary?.recentGenerations) return [];

    return [...summary.recentGenerations].sort((a, b) => {
      if (sortField === "date") {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        return sortDirection === "asc" ? a.count - b.count : b.count - a.count;
      }
    });
  };

  // Zmiana kierunku sortowania
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Sortowane dane
  const sortedGenerations = getSortedGenerations();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ostatnie aktywności</CardTitle>
        <Button variant="ghost" size="sm" onClick={refreshSummary} disabled={isLoading}>
          {isLoading ? "Odświeżanie..." : "Odśwież"}
        </Button>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-500 text-sm p-2 mb-3">{error}</div>}

        {!isLoading && !error && (
          <div className="flex justify-between text-sm font-medium mb-2 px-1">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 p-1 h-auto"
              onClick={() => toggleSort("date")}
            >
              Data
              {sortField === "date" && <span>{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 p-1 h-auto"
              onClick={() => toggleSort("count")}
            >
              Ilość
              {sortField === "count" && <span>{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-100 rounded-md animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm p-2">{error}</div>
        ) : sortedGenerations.length > 0 ? (
          <ul className="space-y-3">
            {sortedGenerations.map((gen) => (
              <li key={gen.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <span className="text-sm text-muted-foreground">{formatDate(gen.date)}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">{gen.count}</span>
                  <span className="ml-1 text-sm text-muted-foreground">fiszek</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center py-4 text-gray-500">Brak ostatnich aktywności</p>
        )}

        {!isLoading && sortedGenerations.length > 0 && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm" onClick={() => setLimit((prev) => prev + 5)}>
              Pokaż więcej
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
