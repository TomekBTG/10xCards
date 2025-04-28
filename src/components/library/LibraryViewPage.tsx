import { useState, useEffect, useCallback } from "react";
import FilterPanel from "./FilterPanel";
import FlashcardList from "./FlashcardList";
import BulkActionsPanel from "./BulkActionsPanel";
import type { FlashcardDTO, FlashcardsListResponseDTO, FlashcardStatus } from "../../types";

// Typ dla filtrów
export interface FlashcardsFilter {
  status?: FlashcardStatus;
  categoryId?: string;
  difficulty?: string;
  createdBefore?: Date;
  createdAfter?: Date;
}

// Rozszerzony typ fiszki dla obsługi UI
export interface FlashcardViewModel extends FlashcardDTO {
  selected: boolean;
}

const LibraryViewPage = () => {
  // Stan dla listy fiszek
  const [flashcards, setFlashcards] = useState<FlashcardViewModel[]>([]);
  // Stan dla filtrów
  const [filters, setFilters] = useState<FlashcardsFilter>({});
  // Stan zaznaczonych fiszek
  const [selectedFlashcards, setSelectedFlashcards] = useState<string[]>([]);
  // Stan ładowania
  const [isLoading, setIsLoading] = useState(true);
  // Stan dla błędu
  const [error, setError] = useState<string | null>(null);
  // Stan dla paginacji
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  // Funkcja pobierająca dane z API
  const fetchFlashcards = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Budowanie parametrów zapytania na podstawie filtrów
      const queryParams = new URLSearchParams();
      queryParams.append("page", pagination.page.toString());
      queryParams.append("limit", pagination.limit.toString());

      if (filters.status) {
        queryParams.append("status", filters.status);
      }

      if (filters.categoryId) {
        queryParams.append("categoryId", filters.categoryId);
      }

      if (filters.difficulty) {
        queryParams.append("difficulty", filters.difficulty);
      }

      if (filters.createdBefore) {
        queryParams.append("createdBefore", filters.createdBefore.toISOString());
      }

      if (filters.createdAfter) {
        queryParams.append("createdAfter", filters.createdAfter.toISOString());
      }

      // Wywołanie API
      const response = await fetch(`/api/flashcards?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FlashcardsListResponseDTO = await response.json();

      // Aktualizacja danych i paginacji
      setFlashcards(data.data.map((flashcard) => ({ ...flashcard, selected: false })));
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas ładowania fiszek");
      console.error("Error fetching flashcards:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Pobranie danych przy montowaniu komponentu i zmianie filtrów/paginacji
  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  // Obsługa zmiany filtrów
  const handleFilterChange = useCallback((newFilters: FlashcardsFilter) => {
    setFilters(newFilters);
    // Reset paginacji przy zmianie filtrów
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Obsługa zaznaczenia/odznaczenia pojedynczej fiszki
  const handleFlashcardSelect = (id: string, selected: boolean) => {
    // Aktualizacja stanu fiszek
    setFlashcards((prev) => prev.map((flashcard) => (flashcard.id === id ? { ...flashcard, selected } : flashcard)));

    // Aktualizacja listy zaznaczonych fiszek
    if (selected) {
      setSelectedFlashcards((prev) => [...prev, id]);
    } else {
      setSelectedFlashcards((prev) => prev.filter((fId) => fId !== id));
    }
  };

  // Obsługa zaznaczenia/odznaczenia wszystkich fiszek
  const handleSelectAll = (selected: boolean) => {
    // Aktualizacja stanu fiszek
    setFlashcards((prev) => prev.map((flashcard) => ({ ...flashcard, selected })));

    // Aktualizacja listy zaznaczonych fiszek
    if (selected) {
      setSelectedFlashcards(flashcards.map((f) => f.id));
    } else {
      setSelectedFlashcards([]);
    }
  };

  // Obsługa aktualizacji statusu dla wielu fiszek
  const handleBulkStatusUpdate = async (status: FlashcardStatus) => {
    if (selectedFlashcards.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      // Dla każdej zaznaczonej fiszki wywołujemy API update
      const updatePromises = selectedFlashcards.map((id) => {
        const flashcard = flashcards.find((f) => f.id === id);
        if (!flashcard) return Promise.resolve();

        return fetch(`/api/flashcards/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            front: flashcard.front,
            back: flashcard.back,
            status,
          }),
        });
      });

      await Promise.all(updatePromises);

      // Ponowne pobranie danych po aktualizacji
      fetchFlashcards();

      // Reset zaznaczonych fiszek
      setSelectedFlashcards([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas aktualizacji fiszek");
      console.error("Error updating flashcards:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Obsługa usuwania wielu fiszek
  const handleBulkDelete = async () => {
    if (selectedFlashcards.length === 0) return;

    if (!confirm(`Czy na pewno chcesz usunąć ${selectedFlashcards.length} zaznaczonych fiszek?`)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Dla każdej zaznaczonej fiszki wywołujemy API delete
      const deletePromises = selectedFlashcards.map((id) =>
        fetch(`/api/flashcards/${id}`, {
          method: "DELETE",
        })
      );

      await Promise.all(deletePromises);

      // Ponowne pobranie danych po usunięciu
      fetchFlashcards();

      // Reset zaznaczonych fiszek
      setSelectedFlashcards([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas usuwania fiszek");
      console.error("Error deleting flashcards:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Obsługa zmiany strony
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // Obsługa aktualizacji pojedynczej fiszki
  const handleFlashcardUpdate = async (id: string, updatedData: Partial<FlashcardDTO>) => {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Aktualizacja lokalnej listy fiszek
      setFlashcards((prev) =>
        prev.map((flashcard) =>
          flashcard.id === id ? { ...flashcard, ...updatedData, selected: flashcard.selected } : flashcard
        )
      );

      return true;
    } catch (error) {
      console.error("Error updating flashcard:", error);
      return false;
    }
  };

  // Obsługa usuwania pojedynczej fiszki
  const handleFlashcardDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Usunięcie fiszki z lokalnej listy
      setFlashcards((prev) => prev.filter((flashcard) => flashcard.id !== id));
      // Usunięcie z listy zaznaczonych, jeśli była zaznaczona
      setSelectedFlashcards((prev) => prev.filter((fId) => fId !== id));

      return true;
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      return false;
    }
  };

  // Obsługa zmiany limitu strony
  const handleLimitChange = (newLimit: number) => {
    setPagination((prev) => ({ ...prev, limit: newLimit }));
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <p>{error}</p>
        </div>
      )}

      <FilterPanel onFilterChange={handleFilterChange} />

      {selectedFlashcards.length > 0 && (
        <BulkActionsPanel
          selectedCount={selectedFlashcards.length}
          onStatusChange={handleBulkStatusUpdate}
          onDelete={handleBulkDelete}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : flashcards.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">Brak fiszek pasujących do wybranych kryteriów</p>
        </div>
      ) : (
        <FlashcardList
          flashcards={flashcards}
          isLoading={isLoading}
          onSelect={handleFlashcardSelect}
          onSelectAll={handleSelectAll}
          onUpdate={handleFlashcardUpdate}
          onDelete={handleFlashcardDelete}
        />
      )}

      {/* Komponent paginacji */}
      {!isLoading && flashcards.length > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
          {/* Wybór liczby elementów na stronie */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Elementy na stronie:</span>
            <select
              className="px-2 py-1 border rounded"
              value={pagination.limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
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
                onClick={() => handlePageChange(1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Pierwsza strona</span>
                <span>&laquo;</span>
              </button>
              <button
                onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      onClick={() => handlePageChange(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.page === pageNumber
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
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
                  handlePageChange(Math.min(Math.ceil(pagination.total / pagination.limit), pagination.page + 1))
                }
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Następna strona</span>
                <span>&rsaquo;</span>
              </button>
              <button
                onClick={() => handlePageChange(Math.ceil(pagination.total / pagination.limit))}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Ostatnia strona</span>
                <span>&raquo;</span>
              </button>
            </nav>
          )}

          {/* Informacja o paginacji */}
          <div className="text-sm text-gray-500">
            Wyświetlanie {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} -{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} z {pagination.total}
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryViewPage;
