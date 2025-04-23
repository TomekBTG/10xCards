<conversation_summary>
<decisions>
Użytkownicy będą przechowywani w tabeli "users" z kolumnami: id (UUID), email, hash_password, created_at oraz name.
Fiszki będą przechowywane w tabeli "flashcards" z kolumnami: id (UUID), front (VARCHAR, max 200 znaków), back (VARCHAR, max 500 znaków), status (np. 'accepted', 'rejected', 'pending'), is_ai_generated (BOOLEAN), is_public (BOOLEAN), created_at, updated_at oraz user_id (klucz obcy do "users"), flashcard_generation_logs_id (klucz obcy do "flashcard_generation_logs")
Każda fiszka będzie miała znacznik informujący, czy została wygenerowana przez AI (is_ai_generated).
Logi generowania fiszek będą przechowywane w tabeli "flashcard_generation_logs" z kolumnami: id (UUID), generated_at, user_input, number_generated oraz user_id (klucz obcy do "users").
Relacja między "users" a "flashcards" będzie typu jeden-do-wielu – jeden użytkownik może mieć wiele fiszek.
Zdecydowano o użyciu UUID jako kluczy głównych we wszystkich tabelach.
Zastosowane będą ograniczenia CHECK na kolumnach "front" (200 znaków) i "back" (500 znaków).
Utworzone zostaną indeksy B-tree na kolumnach "user_id" oraz "is_public" w tabeli "flashcards".
Polityki bezpieczeństwa RLS umożliwią dostęp użytkownikom tylko do ich własnych fiszek lub fiszek oznaczonych jako publiczne.
W tabelach "flashcards" oraz "flashcard_generation_logs" zostaną dodane znaczniki czasowe (created_at, updated_at) wspierające audyt i monitorowanie zmian.
</decisions>
<matched_recommendations>
Użycie UUID jako kluczy głównych dla zwiększenia unikalności i skalowalności.
Definicja ograniczeń CHECK na kolumnach "front" i "back" dla zapewnienia limitów znaków.
Utworzenie oddzielnych tabel: "users", "flashcards" oraz "flashcard_generation_logs" dla rozdzielenia odpowiedzialności.
Implementacja indeksów B-tree na "user_id" i "is_public" dla optymalizacji zapytań.
Wdrożenie polityk RLS, aby użytkownik miał dostęp tylko do swoich fiszek lub fiszek publicznych.
Dodanie znaczników czasowych (created_at, updated_at) dla celów audytu i monitorowania zmian.
</matched_recommendations>
<database_planning_summary>
Projekt bazy danych obejmuje trzy główne tabele:
Tabela "users": zawiera dane użytkowników (id, email, hash_password, created_at, name).
Tabela "flashcards": przechowuje fiszki z ograniczeniami długości tekstu (200 znaków dla frontu, 500 znaków dla tyłu), dodatkowo zawiera kolumny status, is_ai_generated, is_public, znaczniki czasu (created_at, updated_at) oraz odniesienie do użytkownika (user_id) oraz odniesienie do generacji (flashcard_generation_logs_id)
Tabela "flashcard_generation_logs": rejestruje operacje generowania fiszek (data generacji, tekst wejściowy, liczba wygenerowanych fiszek) z relacją do użytkownika (user_id).
Kluczowe relacje:
Jeden użytkownik może posiadać wiele fiszek (relacja jeden-do-wielu między "users" a "flashcards").
Ważne kwestie dotyczące bezpieczeństwa i skalowalności:
Użycie UUID zapewnia unikalność i umożliwia skalowanie.
Indeksowanie kolumn "user_id" i "is_public" zwiększy wydajność zapytań.
Polityki RLS zabezpieczają dane, umożliwiając dostęp tylko do własnych fiszek lub fiszek publicznych.
Znaczniki czasu umożliwiają audyt i monitorowanie zmian w rekordach.
</database_planning_summary>
<unresolved_issues>
Brak nierozwiązanych kwestii – wszystkie wymagania i decyzje zostały jasno określone.
</unresolved_issues>
</conversation_summary>