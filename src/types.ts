// Import the Database type from the database models
import type { Database } from "./db/database.types";

// --------------------------------------------------
// DTO and Command Model Definitions for API
// --------------------------------------------------

// Pagination DTO used in list endpoints
export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
}

// Flashcard DTO representing a flashcard record
// Directly using the database row type for flashcards
export type FlashcardDTO = Database["public"]["Tables"]["flashcards"]["Row"];

// Flashcard Generation Log DTO representing a generation log record
// Including base fields from database plus additional fields needed by the UI
export interface FlashcardGenerationLogDTO {
  id: string;
  user_id: string;
  user_input: string;
  number_generated: number;
  generation_duration: number;
  generated_at: string;
  created_at: string;
  model_used: string;
}

// Command Model for creating a single flashcard
// We pick only the fields required by the API payload: front, back, and is_ai_generated
export type CreateFlashcardCommand = Pick<
  Database["public"]["Tables"]["flashcards"]["Insert"],
  "front" | "back" | "is_ai_generated" | "category_id" | "category_name" | "difficulty"
>;

// Command Model for creating one or multiple flashcards
export interface CreateFlashcardsCommand {
  flashcards: CreateFlashcardCommand[];
}

// Command Model for updating an existing flashcard
// API requires updating front, back, and status. The status is limited to specific string values.
export type FlashcardStatus = "accepted" | "rejected" | "pending";

export interface UpdateFlashcardCommand {
  front: string;
  back: string;
  status: FlashcardStatus;
  category_id?: string;
  category_name?: string;
  difficulty?: "easy" | "medium" | "hard" | null;
}

// Command Model for AI flashcard generation
// This represents the payload for generating flashcards using AI based on user input
export interface GenerateFlashcardsCommand {
  user_input: string;
  category_id?: string;
  category_name?: string;
}

// Response DTO for listing flashcards with pagination
export interface FlashcardsListResponseDTO {
  data: FlashcardDTO[];
  pagination: PaginationDTO;
}

// Response DTO for listing flashcard generation logs with pagination
export interface FlashcardGenerationLogsListResponseDTO {
  data: FlashcardGenerationLogDTO[];
  pagination: PaginationDTO;
}

// Response DTO for AI flashcard generation endpoint
// Contains the generated flashcards and the corresponding log
export interface GenerateFlashcardsResponseDTO {
  flashcards: FlashcardDTO[];
  log: FlashcardGenerationLogDTO;
}

// ------------------------------------------------------------------------------------
// End of DTO and Command Model Definitions
// These types directly reference the database models to ensure consistency with the underlying entities.
// ------------------------------------------------------------------------------------

// ------------------------------------------------------------------------------------
// Quiz View Model Definitions
// ------------------------------------------------------------------------------------

// Quiz Category for grouping flashcards
export interface FlashcardCategory {
  id: string;
  name: string;
  count: number;
}

// Session options for quiz configuration
export interface QuizSessionOptions {
  categoryId?: string | null;
  difficulty?: "easy" | "medium" | "hard" | null;
  status?: FlashcardStatus | null;
  limit?: number;
}

// Quiz Flashcard View Model representing a flashcard in the quiz
export interface QuizFlashcardVM {
  id: string;
  front: string;
  back: string;
  revealed: boolean;
  userAnswer?: "correct" | "incorrect";
  categoryId?: string;
  categoryName?: string;
  difficulty?: string;
}

// Quiz Stats View Model representing the results of a quiz session
export interface QuizStatsVM {
  total: number;
  correctCount: number;
  incorrectCount: number;
  percentCorrect: number;
  durationSeconds: number;
  categories?: Record<string, number>; // Counts by category
}

// Quiz Actions and State for Context or useReducer
export type QuizAction =
  | { type: "LOAD_CARDS"; payload: FlashcardDTO[] }
  | { type: "REVEAL_ANSWER" }
  | { type: "MARK_ANSWER"; payload: "correct" | "incorrect" }
  | { type: "NEXT_CARD" }
  | { type: "RESTART_QUIZ" }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_SESSION_OPTIONS"; payload: QuizSessionOptions }
  | { type: "SET_CATEGORIES"; payload: FlashcardCategory[] };

export interface QuizState {
  cards: QuizFlashcardVM[];
  currentIndex: number;
  isLoading: boolean;
  error: string | null;
  isFinished: boolean;
  stats: QuizStatsVM;
  sessionOptions: QuizSessionOptions;
  categories: FlashcardCategory[];
}
