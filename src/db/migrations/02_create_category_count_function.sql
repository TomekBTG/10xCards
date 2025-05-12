-- Funkcja do pobierania liczby fiszek w każdej kategorii dla danego użytkownika
CREATE OR REPLACE FUNCTION get_flashcard_count_by_category(user_id_param UUID)
RETURNS TABLE(category_id UUID, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.category_id, 
    COUNT(f.id)::BIGINT as count
  FROM 
    flashcards f
  WHERE 
    f.user_id = user_id_param
  GROUP BY 
    f.category_id;
END;
$$ LANGUAGE plpgsql; 