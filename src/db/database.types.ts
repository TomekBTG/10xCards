export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  graphql_public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
  public: {
    Tables: {
      flashcard_generation_logs: {
        Row: {
          generated_at: string; // ISO-8601 timestamp generacji
          generation_duration: number; // Czas trwania generacji w sekundach
          id: string; // UUID logu generacji
          number_generated: number; // Liczba wygenerowanych fiszek
          user_id: string; // UUID użytkownika, który wygenerował fiszki
          user_input: string; // Tekst wprowadzony przez użytkownika do generacji
        };
        Insert: {
          generated_at?: string;
          generation_duration: number;
          id?: string;
          number_generated: number;
          user_id: string;
          user_input: string;
        };
        Update: {
          generated_at?: string;
          generation_duration?: number;
          id?: string;
          number_generated?: number;
          user_id?: string;
          user_input?: string;
        };
        Relationships: [
          {
            foreignKeyName: "flashcard_generation_logs_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      flashcards: {
        Row: {
          back: string; // Treść tylnej strony fiszki
          created_at: string; // ISO-8601 timestamp utworzenia
          flashcard_generation_logs_id: string | null; // Referencja do logu generacji (opcjonalna)
          front: string; // Treść przedniej strony fiszki
          id: string; // UUID fiszki
          is_ai_generated: boolean; // Czy fiszka została wygenerowana przez AI
          is_public: boolean; // Czy fiszka jest publiczna
          status: string; // Status fiszki: accepted, rejected, pending
          updated_at: string; // ISO-8601 timestamp ostatniej aktualizacji
          user_id: string; // UUID właściciela fiszki
          category_id: string | null; // UUID kategorii (opcjonalne)
          category_name: string | null; // Nazwa kategorii (opcjonalne) - do usunięcia po migracji
          difficulty: string | null; // Poziom trudności: easy, medium, hard (opcjonalne)
        };
        Insert: {
          back: string;
          created_at?: string;
          flashcard_generation_logs_id?: string | null;
          front: string;
          id?: string;
          is_ai_generated: boolean;
          is_public?: boolean;
          status: string;
          updated_at?: string;
          user_id: string;
          category_id?: string | null;
          category_name?: string | null;
          difficulty?: string | null;
        };
        Update: {
          back?: string;
          created_at?: string;
          flashcard_generation_logs_id?: string | null;
          front?: string;
          id?: string;
          is_ai_generated?: boolean;
          is_public?: boolean;
          status?: string;
          updated_at?: string;
          user_id?: string;
          category_id?: string | null;
          category_name?: string | null;
          difficulty?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "flashcards_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "flashcards_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "flashcards_flashcard_generation_logs_id_fkey";
            columns: ["flashcard_generation_logs_id"];
            referencedRelation: "flashcard_generation_logs";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: {
      get_flashcard_count_by_category: {
        Args: {
          user_id_param: string;
        };
        Returns: {
          category_id: string;
          count: string;
        }[];
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
