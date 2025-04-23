import { useState } from "react";
import type { FlashcardDTO, FlashcardGenerationLogDTO, GenerateFlashcardsCommand } from "../../types";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { useGenerateFlashcards } from "../../lib/hooks/useGenerateFlashcards";
import { toast } from "sonner";

interface GenerateFlashcardsFormProps {
  onSubmit: (text: string) => void;
  onGenerated: (flashcards: FlashcardDTO[], log: FlashcardGenerationLogDTO) => void;
  onError: (error: string) => void;
  loading: boolean;
  error: string | null;
}

export function GenerateFlashcardsForm({
  onSubmit,
  onGenerated,
  onError,
  loading,
  error,
}: GenerateFlashcardsFormProps) {
  const [text, setText] = useState("");
  const { generateFlashcards } = useGenerateFlashcards();

  // Basic validation of text length
  const isTextTooShort = text.length > 0 && text.length < 500;
  const isTextTooLong = text.length > 10000;
  const isValidInput = text.length >= 500 && text.length <= 10000;

  // Calculate remaining characters
  const minChars = 500;
  const maxChars = 10000;
  const charsRemaining = text.length < minChars ? minChars - text.length : maxChars - text.length;

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidInput) {
      if (isTextTooShort) {
        toast.error("Tekst jest za krótki", {
          description: `Minimalny wymagany rozmiar to ${minChars} znaków.`,
        });
      } else if (isTextTooLong) {
        toast.error("Tekst jest za długi", {
          description: `Maksymalny dozwolony rozmiar to ${maxChars} znaków.`,
        });
      }
      return;
    }

    // Call the parent onSubmit to update loading state
    onSubmit(text);

    // Pokazujemy toast z informacją o rozpoczęciu generowania
    const loadingToastId = toast.loading("Generowanie fiszek...", {
      description: "Trwa generowanie fiszek na podstawie wprowadzonego tekstu.",
    });

    try {
      const command: GenerateFlashcardsCommand = {
        user_input: text,
      };

      const response = await generateFlashcards(command);

      // Aktualizujemy toast po udanym generowaniu
      toast.success(`Wygenerowano ${response.flashcards.length} fiszek`, {
        id: loadingToastId,
        description: "Fiszki zostały pomyślnie wygenerowane. Możesz teraz je przejrzeć.",
      });

      onGenerated(response.flashcards, response.log);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił błąd podczas generowania fiszek";

      // Aktualizujemy toast w przypadku błędu
      toast.error("Błąd generowania", {
        id: loadingToastId,
        description: errorMessage,
      });

      onError(errorMessage);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Wpisz tekst do generowania fiszek</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Wprowadź tekst (min. 500, max. 10000 znaków)..."
              className="min-h-[200px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading}
            />

            <div className="text-sm flex justify-between">
              <div>
                {isTextTooShort && (
                  <p className="text-red-500">
                    Tekst musi zawierać minimum 500 znaków. Brakuje {500 - text.length} znaków.
                  </p>
                )}

                {isTextTooLong && (
                  <p className="text-red-500">
                    Tekst nie może przekraczać 10000 znaków. Usuń {text.length - 10000} znaków.
                  </p>
                )}

                {!isTextTooShort && !isTextTooLong && text.length > 0 && (
                  <p className="text-green-500">Długość tekstu jest odpowiednia.</p>
                )}
              </div>

              <div className={`${charsRemaining < 0 ? "text-red-500" : "text-gray-500"}`}>
                {text.length} / {maxChars} znaków
              </div>
            </div>

            {error && <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-700">{error}</div>}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={!isValidInput || loading}>
            {loading ? (
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
                Generowanie...
              </>
            ) : (
              "Wygeneruj"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
