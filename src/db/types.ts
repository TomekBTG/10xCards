export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      flashcards: {
        Row: {
          id: string;
          front: string;
          back: string;
          status: "accepted" | "rejected" | "pending";
          is_ai_generated: boolean;
          is_public: boolean;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          front: string;
          back: string;
          status: "accepted" | "rejected" | "pending";
          is_ai_generated: boolean;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          front?: string;
          back?: string;
          status?: "accepted" | "rejected" | "pending";
          is_ai_generated?: boolean;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      flashcard_generation_logs: {
        Row: {
          id: string;
          generated_at: string;
          generation_duration: number;
          user_input: string;
          number_generated: number;
          number_accepted: number;
          number_rejected: number;
          user_id: string;
        };
        Insert: {
          id?: string;
          generated_at?: string;
          generation_duration: number;
          user_input: string;
          number_generated: number;
          number_accepted: number;
          number_rejected: number;
          user_id: string;
        };
        Update: {
          id?: string;
          generated_at?: string;
          generation_duration?: number;
          user_input?: string;
          number_generated?: number;
          number_accepted?: number;
          number_rejected?: number;
          user_id?: string;
        };
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
  };
}

// Utility types for ease of use in the application
export type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];
export type NewFlashcard = Database["public"]["Tables"]["flashcards"]["Insert"];
export type UpdateFlashcard = Database["public"]["Tables"]["flashcards"]["Update"];

export type GenerationLog = Database["public"]["Tables"]["flashcard_generation_logs"]["Row"];
export type NewGenerationLog = Database["public"]["Tables"]["flashcard_generation_logs"]["Insert"];
