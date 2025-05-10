import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { FlashcardEditor } from "./FlashcardEditor";
import { FlashcardsList } from "./FlashcardsList";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCategoriesLoader } from "./hooks/useCategoriesLoader";
import type { CreateFlashcardCommand, FlashcardDTO } from "@/types";

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

// Stan formularza dodawania fiszek
interface AddFlashcardsFormState {
  flashcards: FormFlashcard[];
  isSubmitting: boolean;
  submitError: string | null;
  successMessage: string | null;
  showSavedFlashcards: boolean;
  showValidationErrors: boolean;
}

// Payload do zapisania fiszek
interface SaveFlashcardsPayload {
  flashcards: CreateFlashcardCommand[];
}

// Odpowiedź z API po zapisie
interface SaveFlashcardsResponse {
  data: FlashcardDTO[];
  failed: { index: number; error: string }[];
}

// Tworzy pustą fiszkę z unikalnym ID
const createEmptyFlashcard = (): FormFlashcard => ({
  id: uuidv4(),
  front: "",
  back: "",
  category_id: null,
  category_name: null,
  difficulty: null,
});

// Hook do zarządzania stanem formularza dodawania fiszek
const useAddFlashcardsForm = () => {
  const [formState, setFormState] = useState<AddFlashcardsFormState>({
    flashcards: [createEmptyFlashcard()], // zaczynamy od jednej pustej fiszki
    isSubmitting: false,
    submitError: null,
    successMessage: null,
    showSavedFlashcards: false,
    showValidationErrors: false,
  });

  // Waliduje wszystkie fiszki
  const validateFlashcards = useCallback((flashcards: FormFlashcard[]): FormFlashcard[] => {
    return flashcards.map((flashcard) => {
      const errors: FormFlashcard["errors"] = {};

      // Walidacja front (wymagane, max 200 znaków)
      if (!flashcard.front.trim()) {
        errors.front = "Treść przedniej strony jest wymagana";
      } else if (flashcard.front.length > 200) {
        errors.front = "Maksymalna długość to 200 znaków";
      }

      // Walidacja back (wymagane, max 500 znaków)
      if (!flashcard.back.trim()) {
        errors.back = "Treść tylnej strony jest wymagana";
      } else if (flashcard.back.length > 500) {
        errors.back = "Maksymalna długość to 500 znaków";
      }

      // Walidacja kategorii
      if (!flashcard.category_id && (!flashcard.category_name || !flashcard.category_name.trim())) {
        errors.category = "Kategoria jest wymagana";
      }

      // Walidacja poziomu trudności
      if (!flashcard.difficulty) {
        errors.difficulty = "Poziom trudności jest wymagany";
      }

      return { ...flashcard, errors };
    });
  }, []);

  // Sprawdza, czy wszystkie fiszki są poprawne
  const areAllFlashcardsValid = useCallback((flashcards: FormFlashcard[]): boolean => {
    return flashcards.every((flashcard) => !flashcard.errors || Object.keys(flashcard.errors).length === 0);
  }, []);

  // Dodaje nową pustą fiszkę
  const addFlashcard = useCallback(() => {
    setFormState((prevState) => ({
      ...prevState,
      flashcards: [...prevState.flashcards, createEmptyFlashcard()],
    }));
  }, []);

  // Usuwa fiszkę po indeksie
  const removeFlashcard = useCallback((index: number) => {
    setFormState((prevState) => {
      // Nie pozwól usunąć ostatniej fiszki
      if (prevState.flashcards.length <= 1) {
        return prevState;
      }

      const updatedFlashcards = [...prevState.flashcards];
      updatedFlashcards.splice(index, 1);

      return {
        ...prevState,
        flashcards: updatedFlashcards,
      };
    });
  }, []);

  // Aktualizuje fiszkę po indeksie
  const updateFlashcard = useCallback(
    (index: number, updatedFlashcard: FormFlashcard) => {
      setFormState((prevState) => {
        const updatedFlashcards = [...prevState.flashcards];
        updatedFlashcards[index] = updatedFlashcard;

        // Jeśli poprawiono błędy, usuń komunikaty błędów dla tej fiszki
        if (prevState.showValidationErrors) {
          const revalidatedFlashcard = validateFlashcards([updatedFlashcard])[0];
          if (areAllFlashcardsValid([revalidatedFlashcard])) {
            updatedFlashcard.errors = {};
          } else {
            updatedFlashcard.errors = revalidatedFlashcard.errors;
          }
        }

        return {
          ...prevState,
          flashcards: updatedFlashcards,
        };
      });
    },
    [validateFlashcards, areAllFlashcardsValid]
  );

  // Przełącza widok zapisanych fiszek
  const toggleSavedFlashcards = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      showSavedFlashcards: !prev.showSavedFlashcards,
    }));
  }, []);

  // Zapisuje wszystkie fiszki
  const saveAllFlashcards = useCallback(async () => {
    // Walidacja
    const validatedFlashcards = validateFlashcards(formState.flashcards);

    setFormState((prev) => ({
      ...prev,
      flashcards: validatedFlashcards,
      showValidationErrors: true,
    }));

    if (!areAllFlashcardsValid(validatedFlashcards)) {
      setFormState((prev) => ({
        ...prev,
        submitError: "Popraw błędy w formularzu przed zapisem",
      }));
      return;
    }

    // Rozpocznij zapis
    setFormState((prev) => ({
      ...prev,
      isSubmitting: true,
      submitError: null,
      successMessage: null,
    }));

    try {
      // Logowanie kategorii w fiszkach
      console.log(
        "Fiszki przed przygotowaniem payloadu:",
        formState.flashcards.map((f) => ({
          id: f.id,
          front: f.front.substring(0, 20) + "...",
          category_id: f.category_id,
          category_name: f.category_name,
        }))
      );

      // Przygotowanie danych zgodnie z API
      const payload: SaveFlashcardsPayload = {
        flashcards: formState.flashcards.map((flashcard) => {
          const preparedFlashcard = {
            front: flashcard.front,
            back: flashcard.back,
            is_ai_generated: false,
            category_id: flashcard.category_id || undefined,
            category_name: !flashcard.category_id && flashcard.category_name ? flashcard.category_name : undefined,
            difficulty: flashcard.difficulty || undefined,
          };

          console.log("Przygotowana fiszka dla API:", {
            front: preparedFlashcard.front.substring(0, 20) + "...",
            category_id: preparedFlashcard.category_id,
            category_name: preparedFlashcard.category_name,
          });

          return preparedFlashcard;
        }),
      };

      // Wywołanie API
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Nie udało się zapisać fiszek");
      }

      const responseData: SaveFlashcardsResponse = await response.json();

      // Obsługa częściowego sukcesu
      if (responseData.failed && responseData.failed.length > 0) {
        const updatedFlashcards = [...formState.flashcards];

        // Oznacz fiszki z błędami
        responseData.failed.forEach(({ index, error }) => {
          if (updatedFlashcards[index]) {
            updatedFlashcards[index] = {
              ...updatedFlashcards[index],
              errors: {
                ...updatedFlashcards[index].errors,
                general: error,
              },
            };
          }
        });

        setFormState({
          flashcards: updatedFlashcards,
          isSubmitting: false,
          submitError: `Zapisano ${responseData.data.length} z ${formState.flashcards.length} fiszek`,
          successMessage: null,
          showSavedFlashcards: false,
          showValidationErrors: false,
        });

        toast.warning(`Zapisano częściowo: ${responseData.data.length} z ${formState.flashcards.length} fiszek.`);
      } else {
        // Pełny sukces
        setFormState({
          flashcards: [createEmptyFlashcard()], // Reset formularza
          isSubmitting: false,
          submitError: null,
          successMessage: `Zapisano ${responseData.data.length} fiszek`,
          showSavedFlashcards: false,
          showValidationErrors: false,
        });

        toast.success(`Zapisano pomyślnie ${responseData.data.length} fiszek!`);
      }
    } catch (error) {
      console.error("Błąd podczas zapisywania fiszek:", error);

      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
        submitError: error instanceof Error ? error.message : "Wystąpił nieznany błąd podczas zapisywania",
      }));

      toast.error("Błąd podczas zapisywania fiszek");
    }
  }, [formState.flashcards, validateFlashcards, areAllFlashcardsValid]);

  // Reset formularza
  const resetForm = useCallback(() => {
    setFormState({
      flashcards: [createEmptyFlashcard()],
      isSubmitting: false,
      submitError: null,
      successMessage: null,
      showSavedFlashcards: false,
      showValidationErrors: false,
    });
  }, []);

  return {
    formState,
    addFlashcard,
    removeFlashcard,
    updateFlashcard,
    saveAllFlashcards,
    resetForm,
    toggleSavedFlashcards,
  };
};

// Komponent formularza dodawania fiszek
export default function FlashcardsAddForm() {
  const {
    formState,
    addFlashcard,
    removeFlashcard,
    updateFlashcard,
    saveAllFlashcards,
    resetForm,
    toggleSavedFlashcards,
  } = useAddFlashcardsForm();

  // Pobierz kategorie z API
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategoriesLoader();

  // Funkcja wybierająca fiszkę do edycji
  const handleSelectForEdit = (index: number) => {
    // Przewijamy do odpowiedniej fiszki
    const element = document.getElementById(`flashcard-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      // Dodajemy efekt podświetlenia
      element.classList.add("ring-2", "ring-blue-500");
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-blue-500");
      }, 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Edytory fiszek */}
      <div className="space-y-6">
        {formState.flashcards.map((flashcard, index) => (
          <div key={flashcard.id} id={`flashcard-${index}`}>
            <FlashcardEditor
              flashcard={flashcard}
              onChange={(updatedFlashcard) => updateFlashcard(index, updatedFlashcard)}
              onRemove={() => removeFlashcard(index)}
              index={index}
              canDelete={formState.flashcards.length > 1}
              categories={categories}
            />
          </div>
        ))}

        {/* Wskaźnik ładowania kategorii */}
        {categoriesLoading && (
          <div className="flex items-center justify-center py-2 text-gray-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Ładowanie kategorii...
          </div>
        )}

        {/* Błąd ładowania kategorii */}
        {categoriesError && (
          <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm">
            Błąd podczas ładowania kategorii: {categoriesError}
          </div>
        )}
      </div>

      {/* Przyciski akcji */}
      <div className="flex flex-wrap gap-3 justify-end">
        <Button type="button" variant="outline" onClick={addFlashcard}>
          Dodaj kolejną fiszkę
        </Button>

        <Button type="button" onClick={saveAllFlashcards} disabled={formState.isSubmitting}>
          {formState.isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Zapisywanie...
            </>
          ) : (
            "Zapisz wszystkie fiszki"
          )}
        </Button>

        {formState.flashcards.length > 1 && (
          <Button type="button" variant="outline" onClick={resetForm} className="mr-auto">
            Wyczyść formularz
          </Button>
        )}
      </div>

      {/* Komunikaty błędów i sukcesu */}
      {formState.submitError && (
        <div className="p-4 mt-4 bg-red-50 text-red-800 rounded-md">{formState.submitError}</div>
      )}

      {formState.successMessage && (
        <div className="p-4 mt-4 bg-green-50 text-green-800 rounded-md">{formState.successMessage}</div>
      )}

      {/* Lista utworzonych fiszek */}
      {formState.flashcards.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium">Fiszki w tym formularzu ({formState.flashcards.length})</h2>
            <Button type="button" variant="ghost" size="sm" onClick={toggleSavedFlashcards}>
              {formState.showSavedFlashcards ? "Ukryj listę" : "Pokaż listę"}
            </Button>
          </div>

          {formState.showSavedFlashcards && (
            <FlashcardsList flashcards={formState.flashcards} onSelectForEdit={handleSelectForEdit} />
          )}
        </div>
      )}
    </div>
  );
}
