import { Checkbox } from "@/components/ui/checkbox";
import FlashcardItem from "./FlashcardItem";
import type { FlashcardViewModel } from "./LibraryViewPage";
import type { FlashcardDTO } from "../../types";

interface FlashcardListProps {
  flashcards: FlashcardViewModel[];
  isLoading: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onUpdate?: (id: string, data: Partial<FlashcardDTO>) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
}

const FlashcardList = ({ flashcards, isLoading, onSelect, onSelectAll, onUpdate, onDelete }: FlashcardListProps) => {
  // Sprawdzenie, czy wszystkie fiszki są zaznaczone
  const allSelected = flashcards.length > 0 && flashcards.every((f) => f.selected);

  // Obsługa zaznaczenia/odznaczenia wszystkich fiszek
  const handleSelectAllChange = (checked: boolean) => {
    onSelectAll(checked);
  };

  // Komunikat ładowania
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  // Komunikat o braku fiszek
  if (flashcards.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-lg shadow dark:shadow-zinc-800/20 text-center">
        <p className="text-gray-500 dark:text-gray-400">Brak fiszek pasujących do wybranych kryteriów</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow dark:shadow-zinc-800/20 overflow-hidden">
        {/* Nagłówek tabeli */}
        <div className="flex items-center p-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800">
          <div className="flex items-center w-12">
            <Checkbox
              id="select-all"
              checked={allSelected}
              onCheckedChange={handleSelectAllChange}
              className="data-[state=checked]:bg-blue-500"
            />
            <label htmlFor="select-all" className="sr-only">
              Zaznacz wszystkie
            </label>
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="font-medium text-gray-900 dark:text-gray-100">Front</div>
            <div className="font-medium text-gray-900 dark:text-gray-100">Tył</div>
            <div className="hidden md:block font-medium text-gray-900 dark:text-gray-100">Status</div>
            <div className="hidden md:block font-medium text-gray-900 dark:text-gray-100">Akcje</div>
          </div>
        </div>

        {/* Lista fiszek */}
        <div>
          {flashcards.map((flashcard) => (
            <FlashcardItem
              key={flashcard.id}
              flashcard={flashcard}
              onSelect={onSelect}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlashcardList;
