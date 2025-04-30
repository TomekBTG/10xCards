import { useCallback } from "react";
import { FlashcardFrontContent } from "./FlashcardFrontContent";
import { FlashcardBackContent } from "./FlashcardBackContent";
import { FlashcardCategorySelector } from "./FlashcardCategorySelector";
import { FlashcardDifficultySelector } from "./FlashcardDifficultySelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { FlashcardCategory } from "@/types";

// Reprezentacja fiszki w formularzu
interface FormFlashcard {
  id: string; // tymczasowe ID w formularzu
  front: string;
  back: string;
  category_id: string | null;
  category_name: string | null;
  difficulty: "easy" | "medium" | "hard" | null;
  errors?: {
    front?: string;
    back?: string;
    category?: string;
    difficulty?: string;
    general?: string;
  };
}

interface FlashcardEditorProps {
  flashcard: FormFlashcard;
  onChange: (updatedFlashcard: FormFlashcard) => void;
  onRemove: () => void;
  index: number;
  canDelete?: boolean;
  categories?: FlashcardCategory[];
}

export function FlashcardEditor({
  flashcard,
  onChange,
  onRemove,
  index,
  canDelete = true,
  categories = [],
}: FlashcardEditorProps) {
  // Funkcje aktualizujące poszczególne pola fiszki
  const updateFront = useCallback(
    (front: string) => {
      onChange({ ...flashcard, front });
    },
    [flashcard, onChange]
  );

  const updateBack = useCallback(
    (back: string) => {
      onChange({ ...flashcard, back });
    },
    [flashcard, onChange]
  );

  const updateCategory = useCallback(
    (category_id: string | null, category_name?: string) => {
      onChange({
        ...flashcard,
        category_id,
        category_name: category_name || null,
      });
    },
    [flashcard, onChange]
  );

  const updateDifficulty = useCallback(
    (difficulty: "easy" | "medium" | "hard" | null) => {
      onChange({ ...flashcard, difficulty });
    },
    [flashcard, onChange]
  );

  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Fiszka #{index + 1}</CardTitle>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="absolute top-2 right-2"
            aria-label="Usuń fiszkę"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ogólny błąd fiszki */}
        {flashcard.errors?.general && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-md text-sm">{flashcard.errors.general}</div>
        )}

        {/* Treść przedniej strony */}
        <FlashcardFrontContent value={flashcard.front} onChange={updateFront} error={flashcard.errors?.front} />

        {/* Treść tylnej strony */}
        <FlashcardBackContent value={flashcard.back} onChange={updateBack} error={flashcard.errors?.back} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Selektor kategorii */}
          <FlashcardCategorySelector
            categories={categories}
            selectedCategoryId={flashcard.category_id}
            newCategoryName={flashcard.category_name || ""}
            onChange={updateCategory}
            error={flashcard.errors?.category}
          />

          {/* Selektor trudności */}
          <FlashcardDifficultySelector 
            value={flashcard.difficulty} 
            onChange={updateDifficulty} 
            error={flashcard.errors?.difficulty}
          />
        </div>
      </CardContent>
    </Card>
  );
}
