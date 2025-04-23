<conversation_summary>
<decisions>
Kluczowe widoki to ekran autoryzacji, dashboard, widok generowania fiszek, widok listy fiszek z modalem do edycji i przyciskiem usuwania, panel użytkownika oraz ekran sesji powtórkowych (tryb quizu).
Użytkownik musi być zalogowany, a po logowaniu przechodzi do widoku generowania fiszek, gdzie wprowadza tekst i klika przycisk "Wygeneruj", aby otrzymać wygenerowane fiszki do recenzji.
Użytkownik ma możliwość edycji obu stron fiszki jednocześnie (strony wyświetlane obok siebie).
Widok wyświetla jedynie podstawowe statystyki – liczbę wygenerowanych fiszek oraz statystyki zaakceptowanych i odrzuconych.
Krytyczne błędy będą komunikowane inline, natomiast mniej istotne błędy i komunikaty sukcesu – za pomocą powiadomień toast.
Interfejs korzysta z gotowych komponentów Shadcn/ui i stylizowany jest przy użyciu Tailwind CSS.
Walidacja formularzy musi być zgodna z ograniczeniami określonymi przez bazę (max 200 znaków dla frontu i max 500 znaków dla tyłu fiszki).
Zarządzanie stanem aplikacji oparte będzie na rekomendowanej strategii (np. React Query) synchronizującej się z API.
UI musi być w pełni responsywny, adekwatny do wyświetlania na desktopie oraz telefonie, oraz spełniać wymogi dostępności WCAG AA.
</decisions>
<matched_recommendations>
Stworzenie spójnej nawigacji oddzielającej ekran autoryzacji od głównego dashboardu oraz widoków generowania i recenzji fiszek.
Wdrożenie mechanizmu zarządzania stanem (np. React Query) dla synchronizacji danych z API.
Projektowanie intuicyjnego przepływu użytkownika dla generowania fiszek: wprowadzenie tekstu, generowanie fiszek oraz ich edycja przed akceptacją.
Wykorzystanie gotowych komponentów z Shadcn/ui i Tailwind CSS dla zapewnienia spójnego designu.
Zapewnienie responsywności poprzez podejście mobile-first i spełnienie wymagań dostępności (WCAG AA).
Implementacja walidacji formularzy zgodnej z wymaganiami bazy oraz komunikatów błędów odpowiednio wyświetlanych inline i w formie toast.
Zaprojektowanie interfejsu sesji powtórkowych w trybie quizu, umożliwiającego łatwą naukę przez użytkownika.
</matched_recommendations>
<ui_architecture_planning_summary>
Architektura UI dla MVP została zaplanowana na podstawie dokumentu PRD, stosu technologicznego oraz planu API. Główne wymagania obejmują utworzenie następujących widoków: ekran autoryzacji, dashboard, widok generowania fiszek, widok listy fiszek z modalem do edycji (z możliwością edycji obu stron jednocześnie) oraz panel użytkownika z ekranem sesji powtórkowych (prezentacja fiszek w trybie quizu).
Przepływ użytkownika zakłada, że po zalogowaniu użytkownik trafia do widoku generowania, gdzie wprowadza tekst i inicjuje proces generowania fiszek przez kliknięcie przycisku "Wygeneruj". Następnie wyświetlone zostają fiszki do recenzji, w których można dokonać edycji przed ich ostatecznym zatwierdzeniem.
Integracja z API będzie oparta o mechanizmy synchronizacji stanu, takie jak React Query, co umożliwi aktualizację danych w aplikacji. Dodatkowo, UI korzysta z gotowych komponentów Shadcn/ui, a stylizacja odbywa się przy użyciu Tailwind CSS, zapewniając responsywność i dostępność (WCAG AA). Interfejs zawiera mechanizmy walidacji zgodne z ograniczeniami bazy danych oraz implementuje komunikaty błędów inline (dla krytycznych) i powiadomienia toast (dla pozostałych).
</ui_architecture_planning_summary>
<unresolved_issues>
Brak nierozwiązanych kwestii – wszystkie kluczowe elementy zostały określone, choć w przyszłości mogą pojawić się dodatkowe wymagania dotyczące rozbudowy panelu użytkownika i sesji powtórkowych.
</unresolved_issues>
</conversation_summary>