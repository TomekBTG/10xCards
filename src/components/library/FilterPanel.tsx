import { useState, useEffect, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { FlashcardStatus } from "../../types";
import type { FlashcardsFilter } from "./LibraryViewPage";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { flashcardService } from "@/lib/services/flashcardService";

interface FilterPanelProps {
  onFilterChange: (filters: FlashcardsFilter) => void;
}

type ExtendedFlashcardStatus = FlashcardStatus | "all";
type DifficultyType = "easy" | "medium" | "hard" | "all";

const FilterPanel = ({ onFilterChange }: FilterPanelProps) => {
  // Stan filtrów
  const [status, setStatus] = useState<ExtendedFlashcardStatus>("all");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<DifficultyType>("all");
  const [createdBefore, setCreatedBefore] = useState<Date | undefined>(undefined);
  const [createdAfter, setCreatedAfter] = useState<Date | undefined>(undefined);
  // Stan dla przechowywania dostępnych kategorii
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // Pobranie kategorii przy montowaniu komponentu
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await flashcardService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Funkcja do ręcznego stosowania filtrów (zamiast automatycznych efektów)
  const applyFilters = useCallback(() => {
    const newFilters: FlashcardsFilter = {};

    if (status && status !== "all") {
      newFilters.status = status as FlashcardStatus;
    }

    if (categoryId && categoryId !== "all") {
      newFilters.categoryId = categoryId;
    }

    if (difficulty && difficulty !== "all") {
      newFilters.difficulty = difficulty as "easy" | "medium" | "hard";
    }

    if (createdBefore) {
      newFilters.createdBefore = createdBefore;
    }

    if (createdAfter) {
      newFilters.createdAfter = createdAfter;
    }

    onFilterChange(newFilters);
  }, [status, categoryId, difficulty, createdBefore, createdAfter, onFilterChange]);

  // Obsługa zmian filtrów po zmianie wartości
  const handleStatusChange = (value: string) => {
    setStatus(value as ExtendedFlashcardStatus);
    // Opóźnione wywołanie, aby uniknąć wywołania podczas montowania komponentu
    setTimeout(() => {
      applyFilters();
    }, 0);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    setTimeout(() => {
      applyFilters();
    }, 0);
  };

  const handleDifficultyChange = (value: string) => {
    setDifficulty(value as DifficultyType);
    setTimeout(() => {
      applyFilters();
    }, 0);
  };

  const handleDateAfterChange = (date: Date | undefined) => {
    setCreatedAfter(date);
    setTimeout(() => {
      applyFilters();
    }, 0);
  };

  const handleDateBeforeChange = (date: Date | undefined) => {
    setCreatedBefore(date);
    setTimeout(() => {
      applyFilters();
    }, 0);
  };

  // Resetowanie filtrów
  const handleResetFilters = () => {
    setStatus("all");
    setCategoryId("all");
    setDifficulty("all");
    setCreatedBefore(undefined);
    setCreatedAfter(undefined);

    // Wyczyść filtry przez przekazanie pustego obiektu
    // To spowoduje, że zapytanie do API zostanie wykonane bez dodatkowych parametrów
    setTimeout(() => {
      onFilterChange({});
    }, 0);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="text-lg font-semibold mb-4">Filtry</div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Filtr statusu */}
        <div>
          <Label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </Label>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger id="status-filter">
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

        {/* Filtr kategorii */}
        <div>
          <Label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Kategoria
          </Label>
          <Select value={categoryId} onValueChange={handleCategoryChange}>
            <SelectTrigger id="category-filter">
              <SelectValue placeholder="Wybierz kategorię" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtr trudności */}
        <div>
          <Label htmlFor="difficulty-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Trudność
          </Label>
          <Select value={difficulty} onValueChange={handleDifficultyChange}>
            <SelectTrigger id="difficulty-filter">
              <SelectValue placeholder="Wybierz trudność" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              <SelectItem value="easy">Łatwe</SelectItem>
              <SelectItem value="medium">Średnie</SelectItem>
              <SelectItem value="hard">Trudne</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtr daty "od" */}
        <div>
          <Label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-1">
            Utworzone od
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date-from"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !createdAfter && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {createdAfter ? format(createdAfter, "PP", { locale: pl }) : <span>Wybierz datę</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={createdAfter}
                onSelect={handleDateAfterChange}
                initialFocus
                locale={pl}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Filtr daty "do" */}
        <div>
          <Label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-1">
            Utworzone do
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date-to"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !createdBefore && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {createdBefore ? format(createdBefore, "PP", { locale: pl }) : <span>Wybierz datę</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={createdBefore}
                onSelect={handleDateBeforeChange}
                initialFocus
                locale={pl}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Przycisk resetowania filtrów */}
      <div className="mt-4 flex justify-end">
        <Button variant="outline" onClick={handleResetFilters}>
          Resetuj filtry
        </Button>
      </div>
    </div>
  );
};

export default FilterPanel;
