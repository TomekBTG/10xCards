import { useState, useEffect } from "react";
import type { FlashcardDTO, FlashcardCategory } from "../../types";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { flashcardService } from "../../lib/services/flashcardService";

// Rozszerzenie typu FlashcardDTO o opcjonalne pole is_saved
interface FlashcardWithSaveStatus extends FlashcardDTO {
  is_saved?: boolean;
}

interface FlashcardCardProps {
  flashcard: FlashcardWithSaveStatus;
  onAccept: () => void;
  onReject: () => void;
  onEdit: (front: string, back: string, categoryId?: string, categoryName?: string, difficulty?: string | null) => void;
}

export function FlashcardCard({ flashcard, onAccept, onReject, onEdit }: FlashcardCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [frontText, setFrontText] = useState(flashcard.front);
  const [backText, setBackText] = useState(flashcard.back);
  const [categories, setCategories] = useState<FlashcardCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(flashcard.category_id);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | null>(
    flashcard.difficulty as "easy" | "medium" | "hard" | null
  );

  // Pobranie kategorii przy montowaniu komponentu
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await flashcardService.getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Błąd podczas pobierania kategorii:", error);
      }
    };

    fetchCategories();
  }, []);

  // Obsługa rozpoczęcia edycji
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Prepare category data for save
  const getCategoryData = () => {
    if (isAddingCategory && newCategoryName.trim()) {
      const categoryId = `new-${Date.now()}`;
      return {
        categoryId,
        categoryName: newCategoryName.trim(),
      };
    } else if (selectedCategoryId) {
      const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);
      if (selectedCategory) {
        return {
          categoryId: selectedCategory.id,
          categoryName: selectedCategory.name,
        };
      }
    }
    return {
      categoryId: null,
      categoryName: null,
    };
  };

  // Obsługa zapisania zmian
  const handleSaveEdit = () => {
    const { categoryId, categoryName } = getCategoryData();
    onEdit(frontText, backText, categoryId || undefined, categoryName || undefined, difficulty);
    setIsEditing(false);
  };

  // Obsługa anulowania edycji
  const handleCancelEdit = () => {
    setFrontText(flashcard.front);
    setBackText(flashcard.back);
    setSelectedCategoryId(flashcard.category_id);
    setDifficulty(flashcard.difficulty as "easy" | "medium" | "hard" | null);
    setIsAddingCategory(false);
    setNewCategoryName("");
    setIsEditing(false);
  };

  // Obsługa przełączania między wyborem kategorii a dodawaniem nowej
  const toggleAddCategory = () => {
    setIsAddingCategory(!isAddingCategory);
    if (!isAddingCategory) {
      setSelectedCategoryId(null);
    } else {
      setNewCategoryName("");
    }
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

  // Format category and difficulty display
  const getCategoryDisplay = () => {
    return flashcard.category_name || "Bez kategorii";
  };

  const getDifficultyDisplay = () => {
    if (!flashcard.difficulty) return "Nieokreślony";

    const difficultyMap = {
      easy: "Łatwy",
      medium: "Średni",
      hard: "Trudny",
    };

    return difficultyMap[flashcard.difficulty as keyof typeof difficultyMap] || flashcard.difficulty;
  };

  return (
    <Card className={`border-2 ${getStatusClass()}`}>
      <CardContent className="pt-6">
        {isEditing ? (
          <div className="space-y-4">
            {/* Edycja front i back */}
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

            {/* Edycja kategorii */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor={`category-${flashcard.id}`}>Kategoria</Label>
                <Button type="button" variant="ghost" onClick={toggleAddCategory} className="text-sm h-auto py-1">
                  {isAddingCategory ? "Wybierz istniejącą" : "Dodaj nową kategorię"}
                </Button>
              </div>

              {isAddingCategory ? (
                <div>
                  <Input
                    id={`new-category-${flashcard.id}`}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Wprowadź nazwę nowej kategorii"
                  />
                </div>
              ) : (
                <Select
                  value={selectedCategoryId || ""}
                  onValueChange={(value) => setSelectedCategoryId(value || null)}
                >
                  <SelectTrigger id={`category-${flashcard.id}`}>
                    <SelectValue placeholder="Wybierz kategorię" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Edycja poziomu trudności */}
            <div className="space-y-2">
              <Label htmlFor={`difficulty-${flashcard.id}`}>Poziom trudności</Label>
              <Select
                value={difficulty || ""}
                onValueChange={(value) => setDifficulty(value as "easy" | "medium" | "hard" | null)}
              >
                <SelectTrigger id={`difficulty-${flashcard.id}`}>
                  <SelectValue placeholder="Wybierz poziom trudności" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Łatwy</SelectItem>
                  <SelectItem value="medium">Średni</SelectItem>
                  <SelectItem value="hard">Trudny</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-1 text-sm">Kategoria:</h3>
                <div className="p-2 bg-gray-50 rounded-md">{getCategoryDisplay()}</div>
              </div>
              <div>
                <h3 className="font-medium mb-1 text-sm">Poziom trudności:</h3>
                <div className="p-2 bg-gray-50 rounded-md">{getDifficultyDisplay()}</div>
              </div>
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
