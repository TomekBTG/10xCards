import { Card, CardContent } from "@/components/ui/card";

// Reprezentacja fiszki w formularzu
interface FormFlashcard {
  id: string;
  front: string;
  back: string;
  category_id: string | null;
  category_name: string | null;
  difficulty: "easy" | "medium" | "hard" | null;
  errors?: Record<string, string | undefined>;
}

interface FlashcardsListProps {
  flashcards: FormFlashcard[];
  onSelectForEdit: (index: number) => void;
}

// Mapowanie trudności na etykiety
const difficultyLabels: Record<string, string> = {
  easy: "Łatwy",
  medium: "Średni",
  hard: "Trudny",
};

// Mapowanie trudności na kolory
const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
};

export function FlashcardsList({ flashcards, onSelectForEdit }: FlashcardsListProps) {
  // Skróć tekst, jeśli jest zbyt długi
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-4">
      {flashcards.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Brak fiszek. Dodaj pierwszą fiszkę używając formularza powyżej.
        </div>
      ) : (
        flashcards.map((flashcard, index) => (
          <Card
            key={flashcard.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelectForEdit(index)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Przednia strona */}
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">Pytanie:</h3>
                  <p className="text-sm">{truncateText(flashcard.front, 100)}</p>
                </div>

                {/* Tylna strona */}
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">Odpowiedź:</h3>
                  <p className="text-sm">{truncateText(flashcard.back, 100)}</p>
                </div>

                {/* Metadane */}
                <div className="md:w-40 flex flex-col gap-1">
                  {/* Kategoria */}
                  {(flashcard.category_id || flashcard.category_name) && (
                    <div className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                      {flashcard.category_name || "Kategoria"}
                    </div>
                  )}

                  {/* Trudność */}
                  {flashcard.difficulty && (
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${difficultyColors[flashcard.difficulty]}`}
                    >
                      {difficultyLabels[flashcard.difficulty]}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
