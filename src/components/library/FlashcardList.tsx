import { Checkbox } from "@/components/ui/checkbox";
import FlashcardItem from "./FlashcardItem";
import type { FlashcardViewModel } from "./LibraryViewPage";
import type { FlashcardDTO } from "../../types";

interface FlashcardListProps {
  flashcards: FlashcardViewModel[];
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  onSelectFlashcard: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onUpdateFlashcard?: (id: string, data: Partial<FlashcardDTO>) => Promise<boolean>;
  onDeleteFlashcard?: (id: string) => Promise<boolean>;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const FlashcardList = ({
  flashcards,
  isLoading,
  pagination,
  onSelectFlashcard,
  onSelectAll,
  onUpdateFlashcard,
  onDeleteFlashcard,
  onPageChange,
  onLimitChange,
}: FlashcardListProps) => {
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
              onSelect={onSelectFlashcard}
              onUpdate={onUpdateFlashcard}
              onDelete={onDeleteFlashcard}
            />
          ))}
        </div>
      </div>

      {/* Paginacja */}
      {flashcards.length > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
          {/* Wybór liczby elementów na stronie */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Elementy na stronie:</span>
            <select
              className="px-2 py-1 border rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              value={pagination.limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          {/* Przyciski paginacji */}
          {pagination.total > pagination.limit && (
            <nav className="inline-flex rounded-md shadow-sm" aria-label="Paginacja">
              <button
                onClick={() => onPageChange(1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Pierwsza strona</span>
                <span>&laquo;</span>
              </button>
              <button
                onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Poprzednia strona</span>
                <span>&lsaquo;</span>
              </button>

              {/* Renderowanie przycisków stron */}
              {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.limit)) }).map((_, i) => {
                let pageNumber;
                const totalPages = Math.ceil(pagination.total / pagination.limit);

                // Logika wyświetlania maksymalnie 5 przycisków stron
                if (pagination.page <= 3) {
                  // Na początku pokazujemy strony 1-5
                  pageNumber = i + 1;
                } else if (pagination.page >= totalPages - 2) {
                  // Na końcu pokazujemy ostatnie 5 stron
                  pageNumber = totalPages - 4 + i;
                } else {
                  // W środku pokazujemy 2 strony przed i 2 po bieżącej
                  pageNumber = pagination.page - 2 + i;
                }

                // Sprawdzamy czy numer strony jest w poprawnym zakresie
                if (pageNumber > 0 && pageNumber <= totalPages) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => onPageChange(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.page === pageNumber
                          ? "z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-700 text-blue-600 dark:text-blue-400"
                          : "bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                return null;
              })}

              <button
                onClick={() =>
                  onPageChange(Math.min(Math.ceil(pagination.total / pagination.limit), pagination.page + 1))
                }
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Następna strona</span>
                <span>&rsaquo;</span>
              </button>
              <button
                onClick={() => onPageChange(Math.ceil(pagination.total / pagination.limit))}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Ostatnia strona</span>
                <span>&raquo;</span>
              </button>
            </nav>
          )}

          {/* Informacja o paginacji */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Wyświetlanie {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} -{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} z {pagination.total}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardList;
