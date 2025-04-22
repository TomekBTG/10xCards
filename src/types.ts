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
// Directly using the database row type for flashcard_generation_logs
export type FlashcardGenerationLogDTO = Database["public"]["Tables"]["flashcard_generation_logs"]["Row"];

// Command Model for creating a single flashcard
// We pick only the fields required by the API payload: front, back, and is_ai_generated
export type CreateFlashcardCommand = Pick<
  Database["public"]["Tables"]["flashcards"]["Insert"],
  "front" | "back" | "is_ai_generated"
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
}

// Command Model for AI flashcard generation
// This represents the payload for generating flashcards using AI based on user input
export interface GenerateFlashcardsCommand {
  user_input: string;
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
