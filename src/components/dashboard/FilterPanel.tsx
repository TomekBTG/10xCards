import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOptions {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  status: string;
  minCount: number;
  searchTerm: string;
}

interface FilterPanelProps {
  onFilterChange?: (filters: FilterOptions) => void;
  isLoading?: boolean;
}

export default function FilterPanel({ onFilterChange, isLoading = false }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      from: undefined,
      to: undefined,
    },
    status: "all",
    minCount: 0,
    searchTerm: "",
  });

  // Obsługa zmiany filtrów
  const handleFilterChange = (key: keyof FilterOptions, value: string | number | Date | undefined) => {
    if (key !== "dateRange") {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  // Obsługa zmiany daty "od"
  const handleFromDateChange = (date: Date | undefined) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        from: date,
      },
    }));
  };

  // Obsługa zmiany daty "do"
  const handleToDateChange = (date: Date | undefined) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        to: date,
      },
    }));
  };

  // Zastosowanie filtrów
  const applyFilters = () => {
    if (onFilterChange) {
      onFilterChange(filters);
    } else {
      console.log("Zastosowano filtry (brak handlera):", filters);
    }
  };

  // Resetowanie filtrów
  const resetFilters = () => {
    const defaultFilters: FilterOptions = {
      dateRange: {
        from: undefined,
        to: undefined,
      },
      status: "all",
      minCount: 0,
      searchTerm: "",
    };

    setFilters(defaultFilters);
    if (onFilterChange) {
      onFilterChange(defaultFilters);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Filtrowanie danych</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
              disabled={isLoading}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Wybierz status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="accepted">Zaakceptowane</SelectItem>
                <SelectItem value="rejected">Odrzucone</SelectItem>
                <SelectItem value="pending">Oczekujące</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minCount">Minimalna ilość</Label>
            <Input
              id="minCount"
              type="number"
              min="0"
              value={filters.minCount}
              onChange={(e) => handleFilterChange("minCount", parseInt(e.target.value) || 0)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateFrom">Data od</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dateFrom"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange.from && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    format(filters.dateRange.from, "PP", { locale: pl })
                  ) : (
                    <span>Wybierz datę</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.from}
                  onSelect={handleFromDateChange}
                  locale={pl}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateTo">Data do</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dateTo"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange.to && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.to ? (
                    format(filters.dateRange.to, "PP", { locale: pl })
                  ) : (
                    <span>Wybierz datę</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.to}
                  onSelect={handleToDateChange}
                  locale={pl}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="searchTerm">Wyszukiwanie</Label>
            <Input
              id="searchTerm"
              type="text"
              placeholder="Szukaj..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={applyFilters} disabled={isLoading} className="flex-1">
              Zastosuj filtry
            </Button>
            <Button variant="outline" onClick={resetFilters} disabled={isLoading}>
              Resetuj
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
