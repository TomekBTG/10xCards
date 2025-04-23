import { useState } from "react";
import type { FlashcardDTO } from "../../types";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Textarea } from "../ui/textarea";

// Rozszerzenie typu FlashcardDTO o opcjonalne pole is_saved
interface FlashcardWithSaveStatus extends FlashcardDTO {
  is_saved?: boolean;
}

interface FlashcardCardProps {
  flashcard: FlashcardWithSaveStatus;
  onAccept: () => void;
  onReject: () => void;
  onEdit: (front: string, back: string) => void;
}

export function FlashcardCard({ flashcard, onAccept, onReject, onEdit }: FlashcardCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [frontText, setFrontText] = useState(flashcard.front);
  const [backText, setBackText] = useState(flashcard.back);

  // Obsługa rozpoczęcia edycji
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Obsługa zapisania zmian
  const handleSaveEdit = () => {
    onEdit(frontText, backText);
    setIsEditing(false);
  };

  // Obsługa anulowania edycji
  const handleCancelEdit = () => {
    setFrontText(flashcard.front);
    setBackText(flashcard.back);
    setIsEditing(false);
  };

  // Określenie klasy koloru obramowania w zależności od statusu
  const getStatusClass = () => {
    switch (flashcard.status) {
      case "accepted":
        return "border-green-500";
      case "rejected":
        return "border-red-500";
      default:
        return "border-gray-200";
    }
  };

  // Sprawdzanie, czy fiszka została zapisana
  const isSaved = Boolean(flashcard.is_saved);

  return (
    <Card className={`border-2 ${getStatusClass()}`}>
      <CardContent className="pt-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label htmlFor={`front-${flashcard.id}`} className="block text-sm font-medium mb-1">
                Przód fiszki
              </label>
              <Textarea
                id={`front-${flashcard.id}`}
                value={frontText}
                onChange={(e) => setFrontText(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            <div>
              <label htmlFor={`back-${flashcard.id}`} className="block text-sm font-medium mb-1">
                Tył fiszki
              </label>
              <Textarea
                id={`back-${flashcard.id}`}
                value={backText}
                onChange={(e) => setBackText(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-1 text-sm">Przód:</h3>
              <div className="p-3 bg-gray-50 rounded-md min-h-[80px]">{flashcard.front}</div>
            </div>
            <div>
              <h3 className="font-medium mb-1 text-sm">Tył:</h3>
              <div className="p-3 bg-gray-50 rounded-md min-h-[80px]">{flashcard.back}</div>
            </div>
          </div>
        )}

        {isSaved && flashcard.status === "accepted" && (
          <div className="mt-4 p-2 bg-green-50 text-green-700 text-sm rounded-md flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Fiszka została zapisana
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancelEdit}>
              Anuluj
            </Button>
            <Button onClick={handleSaveEdit}>Zapisz zmiany</Button>
          </>
        ) : (
          <>
            {flashcard.status !== "rejected" && !isSaved && (
              <Button variant="destructive" onClick={onReject}>
                Odrzuć
              </Button>
            )}

            {flashcard.status !== "accepted" && !isSaved && (
              <Button variant="outline" onClick={onAccept}>
                Akceptuj
              </Button>
            )}

            {!isSaved && (
              <Button variant="outline" onClick={handleEditClick}>
                Edytuj
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
