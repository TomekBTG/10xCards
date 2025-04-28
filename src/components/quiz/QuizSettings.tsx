import React, { useState } from "react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import type { FlashcardCategory, QuizSessionOptions } from "../../types";

interface QuizSettingsProps {
  categories: FlashcardCategory[];
  settingsOptions: QuizSessionOptions;
  onSettingsChange: (newSettings: QuizSessionOptions) => void;
}

const QuizSettings = React.memo(function QuizSettings({
  categories,
  settingsOptions,
  onSettingsChange,
}: QuizSettingsProps) {
  const [localSettings, setLocalSettings] = useState<QuizSessionOptions>(settingsOptions);

  // Update local state when parent settingsOptions change
  React.useEffect(() => {
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

  // Reset settings
  const resetSettings = () => {
    const resetOptions: QuizSessionOptions = {
      categoryId: null,
      difficulty: null,
      limit: 10,
    };
    setLocalSettings(resetOptions);
    onSettingsChange(resetOptions);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-[1fr_1fr] items-center gap-4">
          <Label htmlFor="category" className="text-right">
            Kategoria:
          </Label>
          <div>
            <Select value={localSettings.categoryId || "all"} onValueChange={handleCategoryChange}>
              <SelectTrigger id="category" className="w-full">
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
        </div>

        <div className="grid grid-cols-[1fr_1fr] items-center gap-4">
          <Label htmlFor="difficulty" className="text-right">
            Poziom trudności:
          </Label>
          <div>
            <Select value={localSettings.difficulty || "all"} onValueChange={handleDifficultyChange}>
              <SelectTrigger id="difficulty" className="w-full">
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

        <div className="grid grid-cols-[1fr_1fr] items-center gap-4">
          <Label htmlFor="limit" className="text-right">
            Liczba fiszek:
          </Label>
          <div>
            <Select value={String(localSettings.limit || 10)} onValueChange={handleLimitChange}>
              <SelectTrigger id="limit" className="w-full">
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
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={resetSettings}>
          Resetuj parametry
        </Button>
      </div>
    </div>
  );
});

QuizSettings.displayName = "QuizSettings";

export default QuizSettings;
