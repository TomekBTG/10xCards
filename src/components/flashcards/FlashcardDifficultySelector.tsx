import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FlashcardDifficultySelectorProps {
  value: "easy" | "medium" | "hard" | null;
  onChange: (value: "easy" | "medium" | "hard" | null) => void;
}

// Mapowanie trudności na etykiety
const difficultyLabels = {
  easy: "Łatwy",
  medium: "Średni",
  hard: "Trudny",
};

export function FlashcardDifficultySelector({ value, onChange }: FlashcardDifficultySelectorProps) {
  // Obsługa zmiany wartości
  const handleChange = useCallback(
    (selectedValue: string) => {
      if (selectedValue === "none") {
        onChange(null);
      } else {
        onChange(selectedValue as "easy" | "medium" | "hard");
      }
    },
    [onChange]
  );

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">Poziom trudności</Label>
        {/* Pusty element, który symuluje wysokość przycisku w komponencie kategorii */}
        <div className="h-7"></div>
      </div>
      <Select value={value || "none"} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Wybierz poziom trudności" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="none">Nieokreślony</SelectItem>
            <SelectItem value="easy">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                {difficultyLabels.easy}
              </span>
            </SelectItem>
            <SelectItem value="medium">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                {difficultyLabels.medium}
              </span>
            </SelectItem>
            <SelectItem value="hard">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                {difficultyLabels.hard}
              </span>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
