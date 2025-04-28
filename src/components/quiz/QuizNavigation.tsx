import React from "react";
import { Button } from "../ui/button";

interface QuizNavigationProps {
  revealed: boolean;
  onReveal: () => void;
  onMark: (correct: boolean) => void;
}

const QuizNavigation: React.FC<QuizNavigationProps> = ({ revealed, onReveal, onMark }) => {
  // Jeśli odpowiedź nie jest ujawniona, pokaż przycisk "Pokaż odpowiedź"
  if (!revealed) {
    return (
      <div className="mt-6 flex justify-center">
        <Button onClick={onReveal} className="px-8" size="lg">
          Pokaż odpowiedź
        </Button>
      </div>
    );
  }

  // Po ujawnieniu odpowiedzi, pokaż przyciski oceny
  return (
    <div className="mt-6 flex justify-between w-full">
      <Button
        onClick={() => onMark(false)}
        variant="outline"
        size="lg"
        className="flex-1 mr-2 border-2 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2"
        >
          <path d="M10 16l-6-6 6-6" />
          <path d="M20 21v-7a4 4 0 0 0-4-4H5" />
        </svg>
        Nie pamiętałem/am
      </Button>
      <Button
        onClick={() => onMark(true)}
        variant="outline"
        size="lg"
        className="flex-1 ml-2 border-2 border-success text-success hover:bg-success/10 hover:text-success"
      >
        Pamiętałem/am
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-2"
        >
          <path d="M14 16l6-6-6-6" />
          <path d="M4 21v-7a4 4 0 0 1 4-4h11" />
        </svg>
      </Button>
    </div>
  );
};

export default QuizNavigation;
