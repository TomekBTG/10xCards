import { useState, useMemo } from "react";
import type { FlashcardDTO, FlashcardGenerationLogDTO } from "../../types";
import { FlashcardCard } from "@/components/views/FlashcardCard";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { flashcardService } from "../../lib/services/flashcardService";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";

// Rozszerzenie typu FlashcardDTO o opcjonalne pole is_saved
interface FlashcardWithSaveStatus extends FlashcardDTO {
  is_saved?: boolean;
}

// Typy sortowania i filtrowania
type SortOption = "default" | "front-asc" | "front-desc" | "back-asc" | "back-desc";
type FilterOption = "all" | "accepted" | "rejected" | "pending" | "saved" | "unsaved";

interface FlashcardsReviewProps {
  flashcards: FlashcardDTO[];
  generationLog: FlashcardGenerationLogDTO | null;
  onReset: () => void;
}

export function FlashcardsReview({ flashcards, generationLog, onReset }: FlashcardsReviewProps) {
  // Konwersja tablicy FlashcardDTO na tablicę FlashcardWithSaveStatus
  const [cards, setCards] = useState<FlashcardWithSaveStatus[]>(
    flashcards.map((card) => ({ ...card, is_saved: false }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  // Liczniki statusów
  const acceptedCount = cards.filter((card) => card.status === "accepted").length;
  const rejectedCount = cards.filter((card) => card.status === "rejected").length;
  const pendingCount = cards.filter((card) => card.status === "pending").length;

  // Filtrowanie fiszek
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      switch (filterBy) {
        case "accepted":
          return card.status === "accepted";
        case "rejected":
          return card.status === "rejected";
        case "pending":
          return card.status === "pending";
        case "saved":
          return card.is_saved;
        case "unsaved":
          return !card.is_saved;
        default:
          return true;
      }
    });
  }, [cards, filterBy]);

  // Sortowanie fiszek
  const sortedAndFilteredCards = useMemo(() => {
    return [...filteredCards].sort((a, b) => {
      switch (sortBy) {
        case "front-asc":
          return a.front.localeCompare(b.front);
        case "front-desc":
          return b.front.localeCompare(a.front);
        case "back-asc":
          return a.back.localeCompare(b.back);
        case "back-desc":
          return b.back.localeCompare(a.back);
        default:
          // Zachowaj oryginalną kolejność
          return 0;
      }
    });
  }, [filteredCards, sortBy]);

  // Obsługa zmiany statusu fiszki
  const handleStatusChange = (id: string, status: "accepted" | "rejected" | "pending") => {
    setCards((currentCards) => currentCards.map((card) => (card.id === id ? { ...card, status } : card)));

    // Powiadomienie o zmianie statusu
    const statusMessages = {
      accepted: "Fiszka została zaakceptowana",
      rejected: "Fiszka została odrzucona",
      pending: "Fiszka została oznaczona jako oczekująca",
    };

    toast.success(statusMessages[status], {
      description: "Status fiszki został zmieniony.",
    });
  };

  // Obsługa edycji treści fiszki
  const handleEdit = (
    id: string,
    front: string,
    back: string,
    categoryId?: string,
    categoryName?: string,
    difficulty?: string | null
  ) => {
    setCards((currentCards) =>
      currentCards.map((card) =>
        card.id === id
          ? {
              ...card,
              front,
              back,
              category_id: categoryId || card.category_id,
              category_name: categoryName || card.category_name,
              difficulty: difficulty || card.difficulty,
            }
          : card
      )
    );

    toast.success("Fiszka została zaktualizowana", {
      description: "Treść fiszki została zapisana.",
    });
  };

  // Zapisywanie zaakceptowanych fiszek
  const handleSaveAccepted = async () => {
    const acceptedCards = cards.filter((card) => card.status === "accepted" && !card.is_saved);

    if (acceptedCards.length === 0) {
      toast.error("Brak fiszek do zapisania", {
        description: "Nie ma żadnych niezapisanych, zaakceptowanych fiszek do zapisania.",
      });
      setSaveError("Nie ma żadnych niezapisanych, zaakceptowanych fiszek do zapisania.");
      return;
    }

    // Informacja o rozpoczęciu zapisywania
    const saveToastId = toast.loading(`Aktualizowanie ${acceptedCards.length} fiszek...`);

    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      // Przekształcenie fiszek do formatu wymaganego przez API i aktualizacja statusu
      for (const card of acceptedCards) {
        // Sprawdzamy, czy difficulty jest zgodne z wymaganym typem
        let typedDifficulty: "easy" | "medium" | "hard" | null = null;
        if (card.difficulty === "easy" || card.difficulty === "medium" || card.difficulty === "hard") {
          typedDifficulty = card.difficulty;
        }

        const updateData = {
          front: card.front,
          back: card.back,
          status: "accepted" as const,
          category_id: card.category_id || undefined,
          category_name: card.category_name || undefined,
          difficulty: typedDifficulty,
        };

        // Aktualizujemy istniejącą fiszkę zamiast tworzyć nową
        await flashcardService.updateFlashcard(card.id, updateData);
      }

      // Aktualizacja statusu zapisanych fiszek w UI
      setCards((currentCards) =>
        currentCards.map((card) => (card.status === "accepted" && !card.is_saved ? { ...card, is_saved: true } : card))
      );

      setSaveSuccess(true);

      // Aktualizacja powiadomienia toast po udanym zapisie
      toast.success(`Zaktualizowano ${acceptedCards.length} fiszek`, {
        id: saveToastId,
        description: "Wszystkie zaakceptowane fiszki zostały pomyślnie zaktualizowane w bazie danych.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Wystąpił błąd podczas aktualizowania fiszek";
      setSaveError(errorMessage);

      // Aktualizacja powiadomienia toast w przypadku błędu
      toast.error("Błąd aktualizacji", {
        id: saveToastId,
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Obsługa resetowania filtrów
  const handleResetFilters = () => {
    setSortBy("default");
    setFilterBy("all");

    toast.info("Filtry zostały zresetowane", {
      description: "Wyświetlono wszystkie fiszki w domyślnej kolejności.",
    });
  };

  // Liczba fiszek do wyświetlenia po filtracji
  const displayedCardsCount = sortedAndFilteredCards.length;
  // Liczba wszystkich fiszek
  const totalCardsCount = cards.length;
  // Liczba niezapisanych zaakceptowanych fiszek
  const unsavedAcceptedCount = cards.filter((card) => card.status === "accepted" && !card.is_saved).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Wygenerowane fiszki</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-md">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{acceptedCount}</p>
              <p className="text-green-700 dark:text-green-400">Zaakceptowane</p>
            </div>
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-md">
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{pendingCount}</p>
              <p className="text-yellow-700 dark:text-yellow-400">Oczekujące</p>
            </div>
            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-md">
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">{rejectedCount}</p>
              <p className="text-red-700 dark:text-red-400">Odrzucone</p>
            </div>
          </div>

          {generationLog && (
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-md">
              <h3 className="font-medium mb-2">Informacje o generowaniu:</h3>
              <ul className="text-sm space-y-1">
                <li>Wygenerowano: {generationLog.number_generated} fiszek</li>
                <li>Czas generowania: {generationLog.generation_duration.toFixed(2)}s</li>
                <li>Model: {generationLog.model_used}</li>
                <li>Data: {new Date(generationLog.generated_at).toLocaleString()}</li>
              </ul>
            </div>
          )}

          {saveError && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-md text-red-700 dark:text-red-400">
              {saveError}
            </div>
          )}

          {saveSuccess && (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-md text-green-700 dark:text-green-400">
              Fiszki zostały pomyślnie zaktualizowane!
            </div>
          )}

          {/* Sortowanie i filtrowanie */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="w-full sm:w-auto">
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-[220px]" aria-label="Sortuj według">
                  <SelectValue placeholder="Sortowanie..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sortowanie</SelectLabel>
                    <SelectItem value="default">Domyślnie</SelectItem>
                    <SelectItem value="front-asc">Przód (A-Z)</SelectItem>
                    <SelectItem value="front-desc">Przód (Z-A)</SelectItem>
                    <SelectItem value="back-asc">Tył (A-Z)</SelectItem>
                    <SelectItem value="back-desc">Tył (Z-A)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-auto">
              <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
                <SelectTrigger className="w-full sm:w-[220px]" aria-label="Filtruj według">
                  <SelectValue placeholder="Filtrowanie..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Filtrowanie</SelectLabel>
                    <SelectItem value="all">Wszystkie</SelectItem>
                    <SelectItem value="accepted">Tylko zaakceptowane</SelectItem>
                    <SelectItem value="rejected">Tylko odrzucone</SelectItem>
                    <SelectItem value="pending">Tylko oczekujące</SelectItem>
                    <SelectItem value="saved">Tylko zapisane</SelectItem>
                    <SelectItem value="unsaved">Tylko niezapisane</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              disabled={sortBy === "default" && filterBy === "all"}
              className="h-10"
            >
              Resetuj filtry
            </Button>

            <div className="flex-grow text-right text-sm text-gray-500 dark:text-gray-400 self-center">
              Wyświetlono {displayedCardsCount} z {totalCardsCount} fiszek
            </div>
          </div>

          {displayedCardsCount === 0 ? (
            <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-md">
              <p className="text-gray-500 dark:text-gray-400">
                Nie znaleziono fiszek spełniających kryteria filtrowania.
              </p>
              <Button variant="link" onClick={handleResetFilters}>
                Resetuj filtry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedAndFilteredCards.map((card) => (
                <FlashcardCard
                  key={card.id}
                  flashcard={card}
                  onAccept={() => handleStatusChange(card.id, "accepted")}
                  onReject={() => handleStatusChange(card.id, "rejected")}
                  onEdit={(front, back, categoryId, categoryName, difficulty) =>
                    handleEdit(card.id, front, back, categoryId, categoryName, difficulty)
                  }
                  onChangeStatus={handleStatusChange}
                />
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onReset} className="mr-auto">
            Wróć do formularza
          </Button>
          <Button onClick={handleSaveAccepted} disabled={isSaving || unsavedAcceptedCount === 0}>
            {isSaving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Aktualizowanie...
              </>
            ) : (
              `Zaktualizuj zaakceptowane (${unsavedAcceptedCount})`
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
