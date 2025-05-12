-- Utwórz tabelę quiz_results
CREATE TABLE public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Parametry sesji
  category_id TEXT,
  difficulty TEXT,
  limit_count INTEGER NOT NULL,
  
  -- Statystyki
  total_cards INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  incorrect_count INTEGER NOT NULL,
  percent_correct INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  
  -- Statystyki kategorii (JSON)
  category_stats JSONB,
  
  -- Indeks dla szybkiego wyszukiwania
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Dodaj indeksy dla poprawy wydajności
CREATE INDEX quiz_results_user_id_idx ON public.quiz_results(user_id);
CREATE INDEX quiz_results_created_at_idx ON public.quiz_results(created_at);

-- Ustaw uprawnienia
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Polityki dostępu - użytkownik widzi tylko swoje wyniki
CREATE POLICY "Users can view their own quiz results" 
  ON public.quiz_results 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz results" 
  ON public.quiz_results 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Zezwól zalogowanym użytkownikom na dostęp do tabeli
GRANT SELECT, INSERT ON public.quiz_results TO authenticated; 