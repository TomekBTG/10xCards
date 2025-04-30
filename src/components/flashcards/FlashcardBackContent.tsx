import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FlashcardBackContentProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function FlashcardBackContent({ value, onChange, error }: FlashcardBackContentProps) {
  // Max długość dla pola tylnej strony fiszki
  const MAX_LENGTH = 500;

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
        <Label htmlFor="back-content" className="text-sm font-medium">
          Tylna strona (odpowiedź)
        </Label>
        <span className={`text-xs ${isLimitExceeded ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}>
          {remainingChars} znaków pozostało
        </span>
      </div>

      <Textarea
        id="back-content"
        value={value}
        onChange={handleChange}
        placeholder="Wprowadź treść tylnej strony fiszki (odpowiedź)"
        className={error ? "border-red-500" : ""}
        rows={4}
      />

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
