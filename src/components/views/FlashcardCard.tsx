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
  onChangeStatus?: (id: string, status: "accepted" | "rejected" | "pending") => void;
}

export function FlashcardCard({ flashcard, onAccept, onReject, onEdit, onChangeStatus }: FlashcardCardProps) {
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

  // Sprawdzanie, czy są zmiany w porównaniu do oryginału
  useEffect(() => {
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

    const categoryChanged = isAddingCategory
      ? Boolean(newCategoryName.trim()) && newCategoryName !== flashcard.category_name
      : selectedCategoryId !== flashcard.category_id;

    const hasAnyChanges =
      frontText !== flashcard.front ||
      backText !== flashcard.back ||
      categoryChanged ||
      difficulty !== flashcard.difficulty;

    // Jeśli są zmiany i fiszka nie jest zapisana, zapisujemy je automatycznie
    if (hasAnyChanges && !flashcard.is_saved) {
      const { categoryId, categoryName } = getCategoryData();
      onEdit(frontText, backText, categoryId || undefined, categoryName || undefined, difficulty);
    }
  }, [
    frontText,
    backText,
    selectedCategoryId,
    newCategoryName,
    isAddingCategory,
    difficulty,
    flashcard,
    onEdit,
    flashcard.is_saved,
    categories,
  ]);

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

  // Obsługa zmiany statusu
  const handleStatusChange = (id: string, status: "accepted" | "rejected" | "pending") => {
    if (onChangeStatus) {
      onChangeStatus(id, status);
    } else {
      if (status === "accepted") {
        onAccept();
      } else if (status === "rejected") {
        onReject();
      }
      // Dla wartości "pending" bez onChangeStatus nie robimy nic
    }
  };

  return (
    <Card className={`border-2 ${getStatusClass()}`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Znacznik statusu fiszki */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Fiszka</h3>
            <div className="flex items-center">
              {flashcard.status === "accepted" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Zaakceptowana
                </span>
              )}
              {flashcard.status === "rejected" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Odrzucona
                </span>
              )}
              {flashcard.status === "pending" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Oczekująca
                </span>
              )}
              {isSaved && (
                <span className="inline-flex items-center ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                  </svg>
                  Zapisana
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`front-${flashcard.id}`} className="block text-sm font-medium mb-1">
                Przód fiszki
              </Label>
              <Textarea
                id={`front-${flashcard.id}`}
                value={frontText}
                onChange={(e) => setFrontText(e.target.value)}
                className="min-h-[80px] focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Wprowadź treść przedniej strony fiszki"
                disabled={isSaved}
              />
            </div>
            <div>
              <Label htmlFor={`back-${flashcard.id}`} className="block text-sm font-medium mb-1">
                Tył fiszki
              </Label>
              <Textarea
                id={`back-${flashcard.id}`}
                value={backText}
                onChange={(e) => setBackText(e.target.value)}
                className="min-h-[80px] focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Wprowadź treść tylnej strony fiszki"
                disabled={isSaved}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor={`category-${flashcard.id}`}>Kategoria</Label>
                {!isSaved && (
                  <Button type="button" variant="ghost" onClick={toggleAddCategory} className="text-sm h-auto py-1">
                    {isAddingCategory ? "Wybierz istniejącą" : "Dodaj nową kategorię"}
                  </Button>
                )}
              </div>

              {isAddingCategory && !isSaved ? (
                <div>
                  <Input
                    id={`new-category-${flashcard.id}`}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Wprowadź nazwę nowej kategorii"
                    disabled={isSaved}
                  />
                </div>
              ) : (
                <Select
                  value={selectedCategoryId || "none"}
                  onValueChange={(value) => setSelectedCategoryId(value === "none" ? null : value)}
                  disabled={isSaved}
                >
                  <SelectTrigger id={`category-${flashcard.id}`}>
                    <SelectValue
                      placeholder={isSaved ? flashcard.category_name || "Bez kategorii" : "Wybierz kategorię"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="none">Bez kategorii</SelectItem>
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

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor={`difficulty-${flashcard.id}`}>Poziom trudności</Label>
                {/* Pusty element dla zachowania układu */}
                <div className="h-7"></div>
              </div>
              <Select
                value={difficulty || "none"}
                onValueChange={(value) =>
                  setDifficulty(value === "none" ? null : (value as "easy" | "medium" | "hard" | null))
                }
                disabled={isSaved}
              >
                <SelectTrigger id={`difficulty-${flashcard.id}`}>
                  <SelectValue placeholder="Wybierz poziom trudności" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nieokreślony</SelectItem>
                  <SelectItem value="easy">Łatwy</SelectItem>
                  <SelectItem value="medium">Średni</SelectItem>
                  <SelectItem value="hard">Trudny</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isSaved && flashcard.status === "accepted" && (
          <div className="mt-4 p-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm rounded-md flex items-center">
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

      <CardFooter className="flex flex-wrap justify-end gap-2">
        {!isSaved && (
          <>
            {flashcard.status !== "pending" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(flashcard.id, "pending")}
                className="border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                Oczekująca
              </Button>
            )}

            {flashcard.status !== "rejected" && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReject}
                className="border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-700 dark:text-red-400"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Odrzuć
              </Button>
            )}

            {flashcard.status !== "accepted" && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAccept}
                className="border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-700 dark:text-green-400"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Akceptuj
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
