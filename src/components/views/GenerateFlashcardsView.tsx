import { useState } from "react";
import { GenerateFlashcardsForm } from "@/components/views/GenerateFlashcardsForm";
import { FlashcardsReview } from "@/components/views/FlashcardsReview";
import type { FlashcardDTO, FlashcardGenerationLogDTO } from "../../types";

// Custom view model for the generate flashcards view
interface GenerateFlashcardsViewModel {
  inputText: string;
  error: string | null;
  loading: boolean;
  flashcards: FlashcardDTO[];
  generationLog: FlashcardGenerationLogDTO | null;
}

export function GenerateFlashcardsView() {
  // State management using the view model structure
  const [viewModel, setViewModel] = useState<GenerateFlashcardsViewModel>({
    inputText: "",
    error: null,
    loading: false,
    flashcards: [],
    generationLog: null,
  });

  // Handle the generation of flashcards
  const handleGenerated = (flashcards: FlashcardDTO[], log: FlashcardGenerationLogDTO) => {
    setViewModel((prev) => ({
      ...prev,
      flashcards,
      generationLog: log,
      loading: false,
    }));
  };

  // Handle errors during generation
  const handleError = (errorMessage: string) => {
    setViewModel((prev) => ({
      ...prev,
      error: errorMessage,
      loading: false,
    }));
  };

  // Set loading state when form is submitted
  const handleSubmit = (text: string) => {
    setViewModel((prev) => ({
      ...prev,
      inputText: text,
      loading: true,
      error: null,
    }));
  };

  return (
    <div className="space-y-8">
      {viewModel.flashcards.length === 0 ? (
        <GenerateFlashcardsForm
          onSubmit={handleSubmit}
          onGenerated={handleGenerated}
          onError={handleError}
          loading={viewModel.loading}
          error={viewModel.error}
        />
      ) : (
        <FlashcardsReview
          flashcards={viewModel.flashcards}
          generationLog={viewModel.generationLog}
          onReset={() =>
            setViewModel((prev) => ({
              ...prev,
              flashcards: [],
              generationLog: null,
            }))
          }
        />
      )}
    </div>
  );
}
