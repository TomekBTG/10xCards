import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FlashcardFrontContentProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function FlashcardFrontContent({ value, onChange, error }: FlashcardFrontContentProps) {
  // Max długość dla pola przedniej strony fiszki
  const MAX_LENGTH = 200;

  // Obsługa zmiany wartości z walidacją długości
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  // Oblicz pozostałą liczbę znaków
  const remainingChars = MAX_LENGTH - value.length;
  const isLimitExceeded = remainingChars < 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="front-content" className="text-sm font-medium">
          Przednia strona (pytanie)
        </Label>
        <span
          className={`text-xs ${isLimitExceeded ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}
        >
          {remainingChars} znaków pozostało
        </span>
      </div>

      <Textarea
        id="front-content"
        value={value}
        onChange={handleChange}
        placeholder="Wprowadź treść przedniej strony fiszki (pytanie)"
        className={error ? "border-red-500" : ""}
        rows={3}
      />

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
