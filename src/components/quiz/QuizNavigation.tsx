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
      <div className="flex justify-center">
        <Button 
          onClick={onReveal} 
          className="px-8 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Pokaż odpowiedź
        </Button>
      </div>
    );
  }

  // Po ujawnieniu odpowiedzi, pokaż przyciski oceny
  return (
    <div className="flex justify-between w-full">
      <Button
        onClick={() => onMark(false)}
        variant="outline"
        className="flex-1 mr-2 border-2 border-red-500 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
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
        className="flex-1 ml-2 border-2 border-green-500 dark:border-green-600 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
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
