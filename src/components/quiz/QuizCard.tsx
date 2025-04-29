import React from "react";
import { type QuizFlashcardVM } from "../../types";
import { cn } from "../../lib/utils";

interface QuizCardProps {
  card: QuizFlashcardVM;
}

// Using React.memo to prevent unnecessary re-renders
const QuizCard = React.memo(function QuizCard({ card }: QuizCardProps) {
  return (
    <div className="w-full">
      <div className="flex flex-col">
        {/* Front of card - always visible */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Pytanie:</h3>
          <div className="text-xl font-medium text-gray-900 dark:text-gray-100">{card.front}</div>
        </div>

        {/* Category indicator if available */}
        {card.categoryName && (
          <div className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-zinc-700">
            Kategoria: {card.categoryName}
          </div>
        )}

        {/* Back of card - only visible when revealed */}
        <div
          className={cn(
            "p-6 bg-gray-50 dark:bg-zinc-800 transition-all duration-300 border-t border-gray-200 dark:border-zinc-700",
            card.revealed ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          )}
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Odpowiedź:</h3>
          <div className="text-xl font-medium text-gray-900 dark:text-gray-100">{card.back}</div>
        </div>

        {/* Card status indicator - shown after user marks the answer */}
        {card.userAnswer && (
          <div
            className={cn(
              "px-4 py-2 text-sm font-medium text-white text-center border-t border-gray-200 dark:border-zinc-700",
              card.userAnswer === "correct" 
                ? "bg-green-500 dark:bg-green-600" 
                : "bg-red-500 dark:bg-red-600"
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
