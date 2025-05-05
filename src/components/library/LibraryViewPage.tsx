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
  searchTerm?: string;
}

// Rozszerzony typ fiszki dla obsługi UI
export interface FlashcardViewModel extends FlashcardDTO {
  selected: boolean;
}

// ------------------------------------------------
// Custom hooks
// ------------------------------------------------

// Hook do zarządzania stanem fiszek
export function useFlashcards() {
  // Stan dla listy fiszek
  const [flashcards, setFlashcards] = useState<FlashcardViewModel[]>([]);
  // Stan zaznaczonych fiszek
  const [selectedFlashcards, setSelectedFlashcards] = useState<string[]>([]);
  // Stan ładowania
  const [isLoading, setIsLoading] = useState(true);
  // Stan dla błędu
  const [error, setError] = useState<string | null>(null);

  // Obsługa zaznaczenia/odznaczenia pojedynczej fiszki
  const handleFlashcardSelect = useCallback((id: string, selected: boolean) => {
    // Aktualizacja stanu fiszek
    setFlashcards((prev) => prev.map((flashcard) => (flashcard.id === id ? { ...flashcard, selected } : flashcard)));

    // Aktualizacja listy zaznaczonych fiszek
    if (selected) {
      setSelectedFlashcards((prev) => [...prev, id]);
    } else {
      setSelectedFlashcards((prev) => prev.filter((fId) => fId !== id));
    }
  }, []);

  // Obsługa zaznaczenia/odznaczenia wszystkich fiszek
  const handleSelectAll = useCallback((selected: boolean) => {
    // Aktualizacja stanu fiszek
    setFlashcards((prev) => prev.map((flashcard) => ({ ...flashcard, selected })));

    // Aktualizacja listy zaznaczonych fiszek
    if (selected) {
      setSelectedFlashcards(flashcards.map((f) => f.id));
    } else {
      setSelectedFlashcards([]);
    }
  }, [flashcards]);

  // Obsługa aktualizacji pojedynczej fiszki
  const handleFlashcardUpdate = useCallback(async (id: string, updatedData: Partial<FlashcardDTO>) => {
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
  }, []);

  // Obsługa usuwania pojedynczej fiszki
  const handleFlashcardDelete = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Usunięcie fiszki z lokalnej listy
      setFlashcards((prev) => prev.filter((flashcard) => flashcard.id !== id));
      setSelectedFlashcards((prev) => prev.filter((fId) => fId !== id));

      return true;
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      return false;
    }
  }, []);

  return {
    flashcards,
    setFlashcards,
    selectedFlashcards,
    setSelectedFlashcards,
    isLoading,
    setIsLoading,
    error,
    setError,
    handleFlashcardSelect,
    handleSelectAll,
    handleFlashcardUpdate,
    handleFlashcardDelete
  };
}

// Hook do zarządzania paginacją
export function usePagination() {
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  }, []);

  return {
    pagination,
    setPagination,
    handlePageChange,
    handleLimitChange
  };
}

// Hook do zarządzania filtrami
export function useFilters() {
  const [filters, setFilters] = useState<FlashcardsFilter>({});

  const handleFilterChange = useCallback((newFilters: FlashcardsFilter) => {
    setFilters(newFilters);
  }, []);

  return {
    filters,
    setFilters,
    handleFilterChange
  };
}

// Hook do pobierania danych z API
export function useFlashcardsApi(
  filters: FlashcardsFilter,
  pagination: { page: number; limit: number; total: number },
  setPagination: React.Dispatch<React.SetStateAction<{ page: number; limit: number; total: number }>>,
  setFlashcards: React.Dispatch<React.SetStateAction<FlashcardViewModel[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
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

      if (filters.searchTerm) {
        queryParams.append("search", filters.searchTerm);
      }

      // Wywołanie API
      const response = await fetch(`/api/flashcards?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FlashcardsListResponseDTO = await response.json();

      // Aktualizacja danych i paginacji
      setFlashcards(data.data.map((flashcard) => ({ ...flashcard, selected: false })));
      setPagination(prev => ({ ...prev, total: data.pagination.total }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas ładowania fiszek");
      console.error("Error fetching flashcards:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, setFlashcards, setPagination, setIsLoading, setError]);

  return { fetchFlashcards };
}

// Hook do operacji masowych
export function useBulkOperations(
  selectedFlashcards: string[],
  flashcards: FlashcardViewModel[],
  fetchFlashcards: () => Promise<void>,
  setSelectedFlashcards: React.Dispatch<React.SetStateAction<string[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  // Obsługa aktualizacji statusu dla wielu fiszek
  const handleBulkStatusUpdate = useCallback(async (status: FlashcardStatus) => {
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
      await fetchFlashcards();

      // Reset zaznaczonych fiszek
      setSelectedFlashcards([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas aktualizacji fiszek");
      console.error("Error updating flashcards:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFlashcards, flashcards, fetchFlashcards, setSelectedFlashcards, setIsLoading, setError]);

  // Obsługa usuwania wielu fiszek
  const handleBulkDelete = useCallback(async () => {
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
      await fetchFlashcards();

      // Reset zaznaczonych fiszek
      setSelectedFlashcards([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas usuwania fiszek");
      console.error("Error deleting flashcards:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFlashcards, fetchFlashcards, setSelectedFlashcards, setIsLoading, setError]);

  return { handleBulkStatusUpdate, handleBulkDelete };
}

// Główny komponent strony biblioteki fiszek
const LibraryViewPage = () => {
  // Wykorzystanie customowych hooków
  const {
    flashcards,
    setFlashcards,
    selectedFlashcards,
    setSelectedFlashcards,
    isLoading,
    setIsLoading,
    error,
    setError,
    handleFlashcardSelect,
    handleSelectAll,
    handleFlashcardUpdate,
    handleFlashcardDelete
  } = useFlashcards();
  
  const { pagination, setPagination, handlePageChange, handleLimitChange } = usePagination();
  const { filters, setFilters, handleFilterChange } = useFilters();
  
  // Rejestracja efektu resetującego paginację przy zmianie filtrów
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filters, setPagination]);
  
  const { fetchFlashcards } = useFlashcardsApi(
    filters,
    pagination,
    setPagination,
    setFlashcards,
    setIsLoading,
    setError
  );
  
  const { handleBulkStatusUpdate, handleBulkDelete } = useBulkOperations(
    selectedFlashcards,
    flashcards,
    fetchFlashcards,
    setSelectedFlashcards,
    setIsLoading,
    setError
  );

  // Pobranie danych przy montowaniu komponentu i zmianie filtrów/paginacji
  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Biblioteka fiszek</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative" role="alert">
          <strong className="font-bold">Błąd! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <FilterPanel 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />

      <BulkActionsPanel
        selectedCount={selectedFlashcards.length}
        onStatusUpdate={handleBulkStatusUpdate}
        onDelete={handleBulkDelete}
        isLoading={isLoading}
      />

      <FlashcardList
        flashcards={flashcards}
        isLoading={isLoading}
        pagination={pagination}
        onSelectFlashcard={handleFlashcardSelect}
        onSelectAll={handleSelectAll}
        onUpdateFlashcard={handleFlashcardUpdate}
        onDeleteFlashcard={handleFlashcardDelete}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </div>
  );
};

export default LibraryViewPage;
