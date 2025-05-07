import React, { useState } from "react";
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
    <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800">
        <h2 className="text-xl font-semibold text-white">Filtrowanie danych</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="status" className="text-zinc-300">
              Status
            </Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
              disabled={isLoading}
            >
              <SelectTrigger id="status" className="bg-zinc-800 border-zinc-700 text-zinc-200">
                <SelectValue placeholder="Wybierz status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="accepted">Zaakceptowane</SelectItem>
                <SelectItem value="rejected">Odrzucone</SelectItem>
                <SelectItem value="pending">Oczekujące</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minCount" className="text-zinc-300">
              Minimalna ilość
            </Label>
            <Input
              id="minCount"
              type="number"
              min="0"
              value={filters.minCount}
              onChange={(e) => handleFilterChange("minCount", parseInt(e.target.value) || 0)}
              disabled={isLoading}
              className="bg-zinc-800 border-zinc-700 text-zinc-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateFrom" className="text-zinc-300">
              Data od
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  id="dateFrom"
                  className={cn(
                    "w-full flex items-center justify-start px-3 py-2 text-left font-normal bg-zinc-800 border border-zinc-700 rounded-md hover:bg-zinc-700 transition-colors",
                    !filters.dateRange.from && "text-zinc-400"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    format(filters.dateRange.from, "PP", { locale: pl })
                  ) : (
                    <span>Wybierz datę</span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.from}
                  onSelect={handleFromDateChange}
                  locale={pl}
                  initialFocus
                  className="bg-zinc-800 text-zinc-200"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateTo" className="text-zinc-300">
              Data do
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  id="dateTo"
                  className={cn(
                    "w-full flex items-center justify-start px-3 py-2 text-left font-normal bg-zinc-800 border border-zinc-700 rounded-md hover:bg-zinc-700 transition-colors",
                    !filters.dateRange.to && "text-zinc-400"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.to ? (
                    format(filters.dateRange.to, "PP", { locale: pl })
                  ) : (
                    <span>Wybierz datę</span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.to}
                  onSelect={handleToDateChange}
                  locale={pl}
                  initialFocus
                  className="bg-zinc-800 text-zinc-200"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="searchTerm" className="text-zinc-300">
              Wyszukiwanie
            </Label>
            <Input
              id="searchTerm"
              type="text"
              placeholder="Szukaj..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              disabled={isLoading}
              className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={applyFilters}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Zastosuj filtry
            </button>
            <button
              onClick={resetFilters}
              disabled={isLoading}
              className="px-4 py-2 bg-zinc-800 text-zinc-200 font-medium rounded-md border border-zinc-700 hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Resetuj
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
