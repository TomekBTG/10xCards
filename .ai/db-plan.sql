/* PostgreSQL Database Schema for 10xCards */

# 1. Tables and Columns

## This table is managed by Supabase Auth.
## Table: users
- id: UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4()
- email: VARCHAR NOT NULL UNIQUE
- hash_password: VARCHAR NOT NULL
- name: VARCHAR NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()

## Table: categories
- id: UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4()
- name: VARCHAR(100) NOT NULL
- user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- updated_at: TIMESTAMPTZ NOT NULL DEFAULT now()

## Table: flashcards
- id: UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4()
- front: VARCHAR(200) NOT NULL CHECK (char_length(front) <= 200)
- back: VARCHAR(500) NOT NULL CHECK (char_length(back) <= 500)
- status: VARCHAR NOT NULL CHECK (status IN ('accepted', 'rejected', 'pending'))
- is_ai_generated: BOOLEAN NOT NULL
- category_id: UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE
- difficulty: TEXT NOT NULL DEFAULT 'medium'
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- updated_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- flashcard_generation_logs_id: UUID REFERENCES flashcard_generation_logs(id) ON DELETE SET NULL

## Table: flashcard_generation_logs
- id: UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4()
- generated_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- generation_duration: INTEGER NOT NULL
- user_input: TEXT NOT NULL
- number_generated: INTEGER NOT NULL
- user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE

## Table: quiz_results
- id: UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()
- user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- category_id: UUID REFERENCES categories(id) ON DELETE SET NULL
- difficulty: TEXT
- limit_count: INTEGER NOT NULL
- total_cards: INTEGER NOT NULL
- correct_count: INTEGER NOT NULL
- incorrect_count: INTEGER NOT NULL
- percent_correct: INTEGER NOT NULL
- duration_seconds: INTEGER NOT NULL
- category_stats: JSONB

# 2. Relationships

- One-to-Many from users to categories: categories.user_id REFERENCES users(id)
- One-to-Many from categories to flashcards: flashcards.category_id REFERENCES categories(id)
- One-to-Many from users to flashcards: flashcards.user_id REFERENCES users(id)
- One-to-Many from users to flashcard_generation_logs: flashcard_generation_logs.user_id REFERENCES users(id)
- One-to-Many from flashcard_generation_logs to flashcards: flashcards.flashcard_generation_logs_id REFERENCES flashcard_generation_logs(id)
- One-to-Many from users to quiz_results: quiz_results.user_id REFERENCES users(id)
- One-to-Many from categories to quiz_results: quiz_results.category_id REFERENCES categories(id)

# 3. Indexes

- CREATE INDEX idx_categories_user_id ON categories(user_id);
- CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
- CREATE INDEX idx_flashcards_category_id ON flashcards(category_id);
- CREATE INDEX quiz_results_user_id_idx ON quiz_results(user_id);
- CREATE INDEX quiz_results_category_id_idx ON quiz_results(category_id);
- CREATE INDEX quiz_results_created_at_idx ON quiz_results(created_at);

# 4. Row-Level Security (RLS) Policies

-- Enable RLS on relevant tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Policies for categories
CREATE POLICY "Users can manage their own categories" 
  ON categories
  FOR ALL
  USING (user_id = auth.uid());

-- Policies for flashcards
CREATE POLICY "Users can manage their own flashcards" 
  ON flashcards
  FOR ALL
  USING (user_id = auth.uid());

-- Policies for quiz_results: users can only view and insert their own results
CREATE POLICY "Users can view their own quiz results" 
  ON quiz_results
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own quiz results" 
  ON quiz_results
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Policies for flashcard_generation_logs
CREATE POLICY "Users can manage their own generation logs" 
  ON flashcard_generation_logs
  FOR ALL
  USING (user_id = auth.uid());

# 5. Migration Notes

- The migration from text-based category_id to UUID-based category_id requires a script to:
  1. Create the new categories table
  2. Extract unique categories from the flashcards table
  3. Insert unique categories into the categories table
  4. Update the flashcards.category_id to reference the new UUID values

# 6. Additional Notes

- Ensure the extension for UUID generation (e.g., uuid-ossp) is enabled in PostgreSQL.
- Timestamps use timezone information (TIMESTAMPTZ) for accurate tracking.
- The schema adheres to 3NF, ensuring data normalization and minimizing redundancy.
- Check constraints enforce the character length limits for 'front' and 'back' columns.
- The categories table allows for proper organization of flashcards with unique identifiers.
- The difficulty field supports values like 'easy', 'medium', and 'hard' for quiz filtering.
- The quiz_results table stores user performance metrics for each completed quiz session.
- The category_stats JSON field allows storing detailed performance by category. 