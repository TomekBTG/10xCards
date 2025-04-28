import React, { useState } from "react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import type { FlashcardCategory, QuizSessionOptions } from "../../types";

interface QuizFiltersProps {
  categories: FlashcardCategory[];
  filterOptions: QuizSessionOptions;
  onFilterChange: (newFilters: QuizSessionOptions) => void;
  onApplyFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const QuizFilters = React.memo(function QuizFilters({
  categories,
  filterOptions,
  onFilterChange,
  onApplyFilters,
  isOpen,
  onToggle,
}: QuizFiltersProps) {
  const [localFilters, setLocalFilters] = useState<QuizSessionOptions>(filterOptions);

  // Update local state when parent filterOptions change
  React.useEffect(() => {
    setLocalFilters(filterOptions);
  }, [filterOptions]);

  // Handle individual filter changes
  const handleCategoryChange = (value: string) => {
    setLocalFilters((prev: QuizSessionOptions) => ({
      ...prev,
      categoryId: value === "all" ? null : value,
    }));
  };

  const handleDifficultyChange = (value: string) => {
    setLocalFilters((prev: QuizSessionOptions) => ({
      ...prev,
      difficulty: (value === "all" ? null : value) as "easy" | "medium" | "hard" | null,
    }));
  };

  const handleLimitChange = (value: string) => {
    setLocalFilters((prev: QuizSessionOptions) => ({
      ...prev,
      limit: parseInt(value, 10),
    }));
  };

  // Apply filters to parent component
  const applyFilters = () => {
    onFilterChange(localFilters);
    onApplyFilters();
  };

  // Reset filters
  const resetFilters = () => {
    const resetOptions: QuizSessionOptions = {
      categoryId: null,
      difficulty: null,
      limit: 10,
    };
    setLocalFilters(resetOptions);
    onFilterChange(resetOptions);
  };

  return (
    <div className="mb-6">
      <Button onClick={onToggle} variant="outline" className="mb-2 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Filtry
      </Button>

      {isOpen && (
        <Card className="w-full mb-4">
          <CardHeader>
            <CardTitle>Filtruj fiszki</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategoria</Label>
                <Select value={localFilters.categoryId || "all"} onValueChange={handleCategoryChange}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Wszystkie kategorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie kategorie</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Poziom trudności</Label>
                <Select value={localFilters.difficulty || "all"} onValueChange={handleDifficultyChange}>
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Wszystkie poziomy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie poziomy</SelectItem>
                    <SelectItem value="easy">Łatwy</SelectItem>
                    <SelectItem value="medium">Średni</SelectItem>
                    <SelectItem value="hard">Trudny</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="limit">Liczba fiszek</Label>
              </div>
              <Select value={String(localFilters.limit || 10)} onValueChange={handleLimitChange}>
                <SelectTrigger id="limit">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 fiszek</SelectItem>
                  <SelectItem value="10">10 fiszek</SelectItem>
                  <SelectItem value="15">15 fiszek</SelectItem>
                  <SelectItem value="20">20 fiszek</SelectItem>
                  <SelectItem value="30">30 fiszek</SelectItem>
                  <SelectItem value="50">50 fiszek</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={resetFilters}>
                Resetuj filtry
              </Button>
              <Button onClick={applyFilters}>Zastosuj filtry</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

QuizFilters.displayName = "QuizFilters";

export default QuizFilters;
