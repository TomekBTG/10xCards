import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { QuizResultsTable } from "../QuizResultsTable";
import type { FlashcardCategory, QuizSessionOptions } from "../../types";

interface QuizSetupProps {
  categories: FlashcardCategory[];
  filterOptions: QuizSessionOptions;
  onFilterChange: (newOptions: QuizSessionOptions) => void;
  onStart: () => void;
  isLoading: boolean;
}

// Komponent wewnętrzny dla ustawień
const Settings = React.memo(function Settings({
  categories,
  settingsOptions,
  onSettingsChange,
}: {
  categories: FlashcardCategory[];
  settingsOptions: QuizSessionOptions;
  onSettingsChange: (newSettings: QuizSessionOptions) => void;
}) {
  const [localSettings, setLocalSettings] = useState<QuizSessionOptions>(settingsOptions);

  // Update local state when parent settingsOptions change
  useEffect(() => {
    setLocalSettings(settingsOptions);
  }, [settingsOptions]);

  // Handle individual settings changes and update parent
  const handleCategoryChange = (value: string) => {
    const newSettings = {
      ...localSettings,
      categoryId: value === "all" ? null : value,
    };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleDifficultyChange = (value: string) => {
    const newSettings = {
      ...localSettings,
      difficulty: (value === "all" ? null : value) as "easy" | "medium" | "hard" | null,
    };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleLimitChange = (value: string) => {
    const newSettings = {
      ...localSettings,
      limit: parseInt(value, 10),
    };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">
            Kategoria
          </Label>
          <Select value={localSettings.categoryId || "all"} onValueChange={handleCategoryChange}>
            <SelectTrigger
              id="category"
              className="w-full bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700"
            >
              <SelectValue placeholder="Wszystkie kategorie" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700">
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
          <Label htmlFor="difficulty" className="text-gray-700 dark:text-gray-300">
            Poziom trudności
          </Label>
          <Select value={localSettings.difficulty || "all"} onValueChange={handleDifficultyChange}>
            <SelectTrigger
              id="difficulty"
              className="w-full bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700"
            >
              <SelectValue placeholder="Wszystkie poziomy" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700">
              <SelectItem value="all">Wszystkie poziomy</SelectItem>
              <SelectItem value="easy">Łatwy</SelectItem>
              <SelectItem value="medium">Średni</SelectItem>
              <SelectItem value="hard">Trudny</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="limit" className="text-gray-700 dark:text-gray-300">
            Liczba fiszek
          </Label>
          <Select value={String(localSettings.limit || 10)} onValueChange={handleLimitChange}>
            <SelectTrigger id="limit" className="w-full bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700">
              <SelectItem value="5">5 fiszek</SelectItem>
              <SelectItem value="10">10 fiszek</SelectItem>
              <SelectItem value="15">15 fiszek</SelectItem>
              <SelectItem value="20">20 fiszek</SelectItem>
              <SelectItem value="30">30 fiszek</SelectItem>
              <SelectItem value="50">50 fiszek</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
});

export default function QuizSetup({ categories, filterOptions, onFilterChange, onStart, isLoading }: QuizSetupProps) {
  const [sessionOptions, setSessionOptions] = useState<QuizSessionOptions>(filterOptions);

  const handleSettingsChange = (newSettings: QuizSessionOptions) => {
    setSessionOptions(newSettings);
    onFilterChange(newSettings);
  };

  const resetSettings = () => {
    const defaultSettings: QuizSessionOptions = {
      categoryId: null,
      difficulty: null,
      limit: 10,
    };
    setSessionOptions(defaultSettings);
    onFilterChange(defaultSettings);
  };

  return (
    <div className="space-y-8">
      <p className="text-muted-foreground mb-6">Skonfiguruj parametry sesji, a następnie rozpocznij naukę z fiszkami</p>

      <Card className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <CardHeader className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800">
          <CardTitle>Parametry sesji</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <Settings categories={categories} settingsOptions={sessionOptions} onSettingsChange={handleSettingsChange} />
        </CardContent>
        <CardFooter className="flex justify-end gap-4 border-t border-gray-200 dark:border-zinc-800 p-6">
          <Button
            variant="outline"
            onClick={resetSettings}
            className="border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
          >
            Resetuj parametry
          </Button>
          <Button onClick={onStart} disabled={isLoading} className="px-8 bg-blue-600 hover:bg-blue-700">
            {isLoading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Ładowanie...
              </>
            ) : (
              "Rozpocznij"
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Tabela z historią wyników */}
      <QuizResultsTable limit={5} />
    </div>
  );
}
