import { useState, useEffect, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { FlashcardStatus } from "../../types";
import type { FlashcardsFilter } from "./LibraryViewPage";
import { cn } from "@/lib/utils";
import { flashcardService } from "@/lib/services/flashcardService";

interface FilterPanelProps {
  filters?: FlashcardsFilter;
  onFilterChange: (filters: FlashcardsFilter) => void;
}

type ExtendedFlashcardStatus = FlashcardStatus | "all";
type DifficultyType = "easy" | "medium" | "hard" | "all";

const FilterPanel = ({ filters = {}, onFilterChange }: FilterPanelProps) => {
  // Stan filtrów
  const [status, setStatus] = useState<ExtendedFlashcardStatus>(
    filters.status ? filters.status : "all"
  );
  const [categoryId, setCategoryId] = useState<string>(
    filters.categoryId ? filters.categoryId : "all"
  );
  const [difficulty, setDifficulty] = useState<DifficultyType>(
    filters.difficulty ? filters.difficulty as DifficultyType : "all"
  );
  const [createdBefore, setCreatedBefore] = useState<Date | undefined>(
    filters.createdBefore
  );
  const [createdAfter, setCreatedAfter] = useState<Date | undefined>(
    filters.createdAfter
  );
  const [searchTerm, setSearchTerm] = useState<string>(
    filters.searchTerm || ""
  );
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
  
  // Aktualizacja stanów lokalnych gdy zmieniają się przekazane filtry
  useEffect(() => {
    setStatus(filters.status ? filters.status : "all");
    setCategoryId(filters.categoryId ? filters.categoryId : "all");
    setDifficulty(filters.difficulty ? filters.difficulty as DifficultyType : "all");
    setCreatedBefore(filters.createdBefore);
    setCreatedAfter(filters.createdAfter);
    setSearchTerm(filters.searchTerm || "");
  }, [filters]);

  // Funkcja do ręcznego stosowania filtrów
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

    if (searchTerm) {
      newFilters.searchTerm = searchTerm;
    }

    onFilterChange(newFilters);
  }, [status, categoryId, difficulty, createdBefore, createdAfter, searchTerm, onFilterChange]);

  // Obsługa zmian filtrów
  const handleFilterChange = (key: string, value: string | Date | undefined) => {
    switch (key) {
      case "status":
        setStatus(value as ExtendedFlashcardStatus);
        break;
      case "categoryId":
        setCategoryId(value as string);
        break;
      case "difficulty":
        setDifficulty(value as DifficultyType);
        break;
      case "createdBefore":
        setCreatedBefore(value as Date | undefined);
        break;
      case "createdAfter":
        setCreatedAfter(value as Date | undefined);
        break;
      case "searchTerm":
        setSearchTerm(value as string);
        break;
    }
  };

  // Resetowanie filtrów
  const handleResetFilters = () => {
    setStatus("all");
    setCategoryId("all");
    setDifficulty("all");
    setCreatedBefore(undefined);
    setCreatedAfter(undefined);
    setSearchTerm("");

    // Wyczyść filtry przez przekazanie pustego obiektu
    onFilterChange({});
  };

  return (
    <div className="mb-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Filtry</h2>
          <Button
            onClick={handleResetFilters}
            variant="ghost"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            Resetuj filtry
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Status fiszki */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-gray-700 dark:text-gray-300">Status</Label>
            <Select
              value={status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger id="status" className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-gray-100">
                <SelectValue placeholder="Wybierz status" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-gray-100">
                <SelectItem value="all">Wszystkie statusy</SelectItem>
                <SelectItem value="accepted">Zaakceptowane</SelectItem>
                <SelectItem value="rejected">Odrzucone</SelectItem>
                <SelectItem value="pending">Oczekujące</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Kategoria */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">Kategoria</Label>
            <Select
              value={categoryId}
              onValueChange={(value) => handleFilterChange("categoryId", value)}
            >
              <SelectTrigger id="category" className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-gray-100">
                <SelectValue placeholder="Wybierz kategorię" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-gray-100">
                <SelectItem value="all">Wszystkie kategorie</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Poziom trudności */}
          <div className="space-y-2">
            <Label htmlFor="difficulty" className="text-gray-700 dark:text-gray-300">Poziom trudności</Label>
            <Select
              value={difficulty}
              onValueChange={(value) => handleFilterChange("difficulty", value)}
            >
              <SelectTrigger id="difficulty" className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-gray-100">
                <SelectValue placeholder="Wybierz poziom trudności" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-gray-100">
                <SelectItem value="all">Wszystkie poziomy</SelectItem>
                <SelectItem value="easy">Łatwy</SelectItem>
                <SelectItem value="medium">Średni</SelectItem>
                <SelectItem value="hard">Trudny</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data utworzenia - od */}
          <div className="space-y-2">
            <Label htmlFor="dateFrom" className="text-gray-700 dark:text-gray-300">Data utworzenia - od</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dateFrom"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-gray-100",
                    !createdAfter && "text-gray-500 dark:text-gray-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {createdAfter ? (
                    format(createdAfter, "PP", { locale: pl })
                  ) : (
                    <span>Wybierz datę</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700">
                <Calendar
                  mode="single"
                  selected={createdAfter}
                  onSelect={(date) => handleFilterChange("createdAfter", date)}
                  locale={pl}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Data utworzenia - do */}
          <div className="space-y-2">
            <Label htmlFor="dateTo" className="text-gray-700 dark:text-gray-300">Data utworzenia - do</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dateTo"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-gray-100",
                    !createdBefore && "text-gray-500 dark:text-gray-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {createdBefore ? (
                    format(createdBefore, "PP", { locale: pl })
                  ) : (
                    <span>Wybierz datę</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700">
                <Calendar
                  mode="single"
                  selected={createdBefore}
                  onSelect={(date) => handleFilterChange("createdBefore", date)}
                  locale={pl}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Wyszukiwarka */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-gray-700 dark:text-gray-300">Szukaj</Label>
            <Input
              id="search"
              type="text"
              placeholder="Wprowadź tekst..."
              value={searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button 
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Zastosuj filtry
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
