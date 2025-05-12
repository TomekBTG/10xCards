-- Migracja 01 - Tworzenie tabeli kategorii i modyfikacja tabeli fiszek

-- Upewnij się, że mamy rozszerzenie UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Funkcja do sprawdzania czy kolumna istnieje
CREATE OR REPLACE FUNCTION column_exists(tbl text, col text) RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = tbl AND column_name = col
    );
END;
$$ LANGUAGE plpgsql;

-- Dodanie tabeli kategorii, jeśli nie istnieje
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE(name, user_id) -- Nazwy kategorii muszą być unikalne dla użytkownika
);

-- Zmiana struktury tabeli fiszek dla wsparcia nowej tabeli kategorii
-- 1. Najpierw stwórzmy tymczasową kolumnę category_id_uuid, jeśli nie istnieje
DO $$
BEGIN
    IF NOT column_exists('flashcards', 'category_id_uuid') THEN
        ALTER TABLE flashcards ADD COLUMN category_id_uuid UUID;
    END IF;
END $$;

-- Funkcja do migracji danych
CREATE OR REPLACE FUNCTION migrate_categories() RETURNS VOID AS $$
DECLARE
    cat_record RECORD;
    new_category_id UUID;
    existing_category_id UUID;
    flashcard_record RECORD;
BEGIN
    -- Dla każdej unikalnej kombinacji category_name i user_id
    FOR cat_record IN 
        SELECT DISTINCT category_name, user_id, category_id 
        FROM flashcards 
        WHERE category_name IS NOT NULL AND category_id != 'uncategorized'
          AND (column_exists('flashcards', 'category_name'))
    LOOP
        -- Sprawdź czy kategoria o tej nazwie już istnieje
        SELECT id INTO existing_category_id 
        FROM categories 
        WHERE name = cat_record.category_name AND user_id = cat_record.user_id;
        
        IF existing_category_id IS NULL THEN
            -- Jeśli nie istnieje, utwórz nową kategorię z nowym UUID
            new_category_id := uuid_generate_v4();
            INSERT INTO categories (id, name, user_id) 
            VALUES (new_category_id, cat_record.category_name, cat_record.user_id);
        ELSE
            -- Jeśli istnieje, użyj istniejącego ID
            new_category_id := existing_category_id;
        END IF;
        
        -- Zaktualizuj category_id_uuid we wszystkich fiszkach z tą nazwą kategorii
        IF column_exists('flashcards', 'category_id_uuid') THEN
            UPDATE flashcards 
            SET category_id_uuid = new_category_id 
            WHERE category_name = cat_record.category_name AND user_id = cat_record.user_id;
        END IF;
    END LOOP;
    
    -- Dodaj kategorię domyślną dla fiszek z category_id = 'uncategorized'
    IF column_exists('flashcards', 'category_id') THEN
        FOR cat_record IN 
            SELECT DISTINCT user_id 
            FROM flashcards 
            WHERE category_id = 'uncategorized'
        LOOP
            -- Sprawdź czy kategoria domyślna już istnieje
            SELECT id INTO existing_category_id 
            FROM categories 
            WHERE name = 'Domyślna kategoria' AND user_id = cat_record.user_id;
            
            IF existing_category_id IS NULL THEN
                -- Jeśli nie istnieje, utwórz nową kategorię domyślną
                new_category_id := uuid_generate_v4();
                INSERT INTO categories (id, name, user_id) 
                VALUES (new_category_id, 'Domyślna kategoria', cat_record.user_id);
            ELSE
                -- Jeśli istnieje, użyj istniejącego ID
                new_category_id := existing_category_id;
            END IF;
            
            -- Zaktualizuj category_id_uuid we wszystkich fiszkach z kategorią uncategorized
            IF column_exists('flashcards', 'category_id_uuid') THEN
                UPDATE flashcards 
                SET category_id_uuid = new_category_id 
                WHERE category_id = 'uncategorized' AND user_id = cat_record.user_id;
            END IF;
        END LOOP;
    END IF;
    
    -- Obsłuż fiszki, które mają niepoprawny format UUID w category_id
    IF column_exists('flashcards', 'category_id') AND column_exists('flashcards', 'category_id_uuid') THEN
        FOR flashcard_record IN
            SELECT id, category_id, user_id
            FROM flashcards
            WHERE category_id_uuid IS NULL AND category_id IS NOT NULL
        LOOP
            -- Utwórz domyślną kategorię dla użytkownika
            SELECT id INTO existing_category_id 
            FROM categories 
            WHERE name = 'Nieznana kategoria' AND user_id = flashcard_record.user_id;
            
            IF existing_category_id IS NULL THEN
                new_category_id := uuid_generate_v4();
                INSERT INTO categories (id, name, user_id) 
                VALUES (new_category_id, 'Nieznana kategoria', flashcard_record.user_id);
            ELSE
                new_category_id := existing_category_id;
            END IF;
            
            -- Przypisz fiszkę do tej kategorii
            UPDATE flashcards 
            SET category_id_uuid = new_category_id 
            WHERE id = flashcard_record.id;
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Wykonaj migrację danych
SELECT migrate_categories();

-- 2. Teraz zamieńmy kolumny
DO $$
BEGIN
    -- Usuwamy kolumnę category_name jeśli istnieje
    IF column_exists('flashcards', 'category_name') THEN
        ALTER TABLE flashcards DROP COLUMN category_name;
    END IF;

    -- Usuwamy stary klucz obcy jeśli istnieje
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_category_id'
    ) THEN
        ALTER TABLE flashcards DROP CONSTRAINT fk_category_id;
    END IF;

    -- Usuwamy starą kolumnę category_id i zmieniamy nazwę nowej kolumny
    IF column_exists('flashcards', 'category_id') AND column_exists('flashcards', 'category_id_uuid') THEN
        ALTER TABLE flashcards DROP COLUMN category_id;
        ALTER TABLE flashcards RENAME COLUMN category_id_uuid TO category_id;
    END IF;
END $$;

-- 3. Dodajmy ograniczenie klucza obcego
ALTER TABLE flashcards ALTER COLUMN category_id SET NOT NULL; -- Upewnij się, że nie ma null
ALTER TABLE flashcards ADD CONSTRAINT fk_category_id FOREIGN KEY (category_id) REFERENCES categories(id);

-- Sprzątanie po migracji
DROP FUNCTION IF EXISTS migrate_categories();
DROP FUNCTION IF EXISTS column_exists(); 