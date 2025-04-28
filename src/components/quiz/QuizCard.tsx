import React from "react";
import { type QuizFlashcardVM } from "../../types";
import { cn } from "../../lib/utils";

interface QuizCardProps {
  card: QuizFlashcardVM;
}

// Using React.memo to prevent unnecessary re-renders
const QuizCard = React.memo(function QuizCard({ card }: QuizCardProps) {
  return (
    <div className="w-full mb-6">
      <div className="flex flex-col bg-card rounded-lg shadow-md overflow-hidden">
        {/* Front of card - always visible */}
        <div className="p-6 border-b">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Pytanie:</h3>
          <div className="text-xl font-medium">{card.front}</div>
        </div>

        {/* Category indicator if available */}
        {card.categoryName && (
          <div className="px-3 py-1 bg-muted/30 text-xs text-muted-foreground">Kategoria: {card.categoryName}</div>
        )}

        {/* Back of card - only visible when revealed */}
        <div
          className={cn(
            "p-6 bg-muted/30 transition-all duration-300",
            card.revealed ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          )}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Odpowiedź:</h3>
          <div className="text-xl font-medium">{card.back}</div>
        </div>

        {/* Card status indicator - shown after user marks the answer */}
        {card.userAnswer && (
          <div
            className={cn(
              "px-4 py-2 text-sm font-medium text-white text-center",
              card.userAnswer === "correct" ? "bg-green-500" : "bg-red-500"
            )}
          >
            {card.userAnswer === "correct" ? "Poprawna odpowiedź" : "Niepoprawna odpowiedź"}
          </div>
        )}
      </div>
    </div>
  );
});

QuizCard.displayName = "QuizCard";

export default QuizCard;
