Stwórz Proof-of-Concept aplikację webową umożliwiającą generowanie fiszek za pomocą AI. Aplikacja ma być zbudowana w oparciu o następujący stack technologiczny:
• Front-end: Astro (wersja 5) jako framework, React (wersja 19) do komponentów interaktywnych oraz TypeScript. Stylowanie wykonaj przy użyciu Tailwind CSS (wersja 4) i komponentów z biblioteki shadcn/ui.
• Backend/API: Minimalny serwis integrujący się z Openrouter.ai (lub symulacja wywołania API), który będzie generował fiszkę na podstawie przesłanego tekstu.
Wymagania funkcjonalne PoC:
Użytkownik powinien mieć prosty interfejs zawierający pole tekstowe do wprowadzenia dowolnego tekstu oraz przycisk umożliwiający wysłanie tego tekstu do usługi AI.
Po przekazaniu tekstu, serwis AI wygeneruje fiszkę, która będzie miała dwie strony:
• Pierwsza strona – zawierająca tekst nie dłuższy niż 200 znaków.
• Druga strona – zawierająca tekst nie dłuższy niż 500 znaków.
Po wygenerowaniu fiszki, użytkownik otrzyma interfejs recenzji z trzema opcjami:
• Akceptuj – zatwierdzenie wygenerowanej fiszki.
• Edytuj – umożliwienie modyfikacji treści fiszki (nadpisanie oryginalnej treści).
• Odrzuć – odrzucenie wygenerowanej fiszki.
Całość implementacji ma być skupiona wyłącznie na funkcjonalności generowania fiszek przy pomocy AI, bez wszelkich dodatkowych funkcji (np. ręcznego tworzenia fiszek, zarządzania użytkownikami, raportowania itp.).
Podejście iteracyjne:
• Na samym początku zaplanuj pracę – przygotuj szczegółowy plan implementacji, który obejmie strukturę front-endu, sposób komunikacji z API generującym fiszki oraz interfejs recenzji.
• Nie rozpocznij implementacji PoC, dopóki nie uzyskasz akceptacji przedstawionego planu.
Upewnij się, że cały prompt zawiera wszystkie niezbędne informacje dotyczące minimalnej funkcjonalności i technologii, bez odwoływania się do zewnętrznych dokumentów.