/* PostgreSQL Database Schema for 10xCards */

# 1. Tables and Columns

## This table is managed by Supabase Auth.
## Table: users
- id: UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4()
- email: VARCHAR NOT NULL UNIQUE
- hash_password: VARCHAR NOT NULL
- name: VARCHAR NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()

## Table: flashcards
- id: UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4()
- front: VARCHAR(200) NOT NULL CHECK (char_length(front) <= 200)
- back: VARCHAR(500) NOT NULL CHECK (char_length(back) <= 500)
- status: VARCHAR NOT NULL CHECK (status IN ('accepted', 'rejected', 'pending'))
- is_ai_generated: BOOLEAN NOT NULL
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

# 2. Relationships

- One-to-Many from users to flashcards: flashcards.user_id REFERENCES users(id)
- One-to-Many from users to flashcard_generation_logs: flashcard_generation_logs.user_id REFERENCES users(id)
- One-to-Many from flashcard_generation_logs to flashcards: flashcards.flashcard_generation_logs_id REFERENCES flashcard_generation_logs(id)

# 3. Indexes

- CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
- CREATE INDEX idx_flashcards_is_public ON flashcards(is_public);

# 4. Row-Level Security (RLS) Policies

-- Enable RLS on relevant tables
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_generation_logs ENABLE ROW LEVEL SECURITY;

-- Example policy for flashcards: allow access if the user owns the record or the flashcard is public
CREATE POLICY user_flashcards_policy ON flashcards
  FOR ALL
  USING (user_id = current_setting('app.current_user_id')::uuid OR is_public = TRUE);

-- Additional policies for flashcard_generation_logs can be defined similarly if needed

# 5. Additional Notes

- Ensure the extension for UUID generation (e.g., uuid-ossp) is enabled in PostgreSQL.
- Timestamps use timezone information (TIMESTAMPTZ) for accurate tracking.
- The schema adheres to 3NF, ensuring data normalization and minimizing redundancy.
- Check constraints enforce the character length limits for 'front' and 'back' columns.
- Indexes on 'user_id' and 'is_public' optimize query performance. 