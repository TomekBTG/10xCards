# Plan implementacji widoku dodawania fiszek

## 1. Przegląd
Widok dodawania fiszek umożliwia użytkownikowi ręczne tworzenie własnych fiszek edukacyjnych. Pozwala na wprowadzenie treści przedniej (pytanie) i tylnej (odpowiedź) strony fiszki, określenie kategorii oraz stopnia trudności. Użytkownik ma możliwość utworzenia wielu fiszek podczas jednej sesji, a wszystkie wprowadzone dane są walidowane przed zapisem.

## 2. Routing widoku
Widok będzie dostępny pod dwoma ścieżkami:
- `/flashcards/add`
- `/create`

## 3. Struktura komponentów
```
FlashcardsAddPage (Astro)
└── FlashcardsAddForm (React)
    ├── FlashcardEditor
    │   ├── FlashcardFrontContent
    │   ├── FlashcardBackContent
    │   ├── FlashcardCategorySelector
    │   └── FlashcardDifficultySelector
    ├── FlashcardsList (lista utworzonych fiszek w sesji)
    └── ActionButtons (dodaj kolejną, zapisz wszystkie)
```

## 4. Szczegóły komponentów
### FlashcardsAddPage (Astro)
- Opis komponentu: Główny komponent strony, który renderuje układ strony i zawiera FlashcardsAddForm.
- Główne elementy: Nagłówek strony, opis funkcjonalności, kontener dla formularza.
- Obsługiwane interakcje: Brak (komponent statyczny).
- Typy: Brak specyficznych typów.
- Propsy: Brak.

### FlashcardsAddForm (React)
- Opis komponentu: Interaktywny formularz umożliwiający dodawanie fiszek.
- Główne elementy:
  - Dynamiczna lista komponentów FlashcardEditor
  - Przyciski akcji (dodaj fiszkę, zapisz wszystkie)
  - Komunikaty błędów i potwierdzenia
- Obsługiwane interakcje:
  - Dodawanie nowej fiszki
  - Usuwanie fiszki z listy
  - Zapisywanie wszystkich fiszek
  - Walidacja pól formularza
- Obsługiwana walidacja:
  - Sprawdzanie długości tekstów (front max 200 znaków, back max 500 znaków)
  - Weryfikacja wymaganych pól (front i back są wymagane)
- Typy:
  - `FormFlashcard` - lokalna reprezentacja fiszki w formularzu
  - `AddFlashcardsFormState` - stan formularza
- Propsy: Brak (komponent główny).

### FlashcardEditor
- Opis komponentu: Edytor pojedynczej fiszki zawierający pola do wypełnienia treści obu stron oraz wybór kategorii i trudności.
- Główne elementy:
  - Pole tekstowe dla przedniej strony fiszki
  - Pole tekstowe dla tylnej strony fiszki
  - Selektor kategorii
  - Selektor trudności
  - Przycisk usunięcia fiszki
- Obsługiwane interakcje:
  - Edycja treści fiszki
  - Wybór kategorii
  - Wybór poziomu trudności
  - Usunięcie fiszki
- Obsługiwana walidacja:
  - Limit znaków (front 200, back 500)
  - Wskaźnik pozostałych znaków
  - Oznaczanie nieprawidłowych pól
- Typy:
  - `FormFlashcard` - dane fiszki w formularzu
- Propsy:
  - `flashcard: FormFlashcard` - dane fiszki
  - `onChange: (updatedFlashcard: FormFlashcard) => void` - obsługa zmian
  - `onRemove: () => void` - obsługa usunięcia
  - `categories: FlashcardCategory[]` - dostępne kategorie
  - `index: number` - indeks fiszki na liście

### FlashcardFrontContent
- Opis komponentu: Pole do wprowadzania treści przedniej strony fiszki.
- Główne elementy:
  - Etykieta tekstowa
  - Pole tekstowe z ograniczeniem znaków
  - Licznik znaków
- Obsługiwane interakcje: Wprowadzanie i edycja tekstu.
- Obsługiwana walidacja: Limit 200 znaków, pole wymagane.
- Propsy:
  - `value: string` - aktualna treść
  - `onChange: (value: string) => void` - obsługa zmian
  - `error?: string` - komunikat błędu

### FlashcardBackContent
- Opis komponentu: Pole do wprowadzania treści tylnej strony fiszki.
- Główne elementy:
  - Etykieta tekstowa
  - Większe pole tekstowe z ograniczeniem znaków
  - Licznik znaków
- Obsługiwane interakcje: Wprowadzanie i edycja tekstu.
- Obsługiwana walidacja: Limit 500 znaków, pole wymagane.
- Propsy:
  - `value: string` - aktualna treść
  - `onChange: (value: string) => void` - obsługa zmian
  - `error?: string` - komunikat błędu

### FlashcardCategorySelector
- Opis komponentu: Selektor kategorii z możliwością dodania nowej.
- Główne elementy:
  - Lista rozwijana z istniejącymi kategoriami
  - Pole do wprowadzenia nowej kategorii
  - Przycisk przełączania między wyborem a tworzeniem
- Obsługiwane interakcje:
  - Wybór istniejącej kategorii
  - Dodanie nowej kategorii
- Propsy:
  - `categories: FlashcardCategory[]` - dostępne kategorie
  - `selectedCategoryId: string | null` - ID wybranej kategorii
  - `newCategoryName: string` - nazwa nowej kategorii
  - `onChange: (categoryId: string | null, categoryName?: string) => void` - obsługa zmian

### FlashcardDifficultySelector
- Opis komponentu: Selektor poziomu trudności fiszki.
- Główne elementy: Lista rozwijana z trzema opcjami (łatwy, średni, trudny).
- Obsługiwane interakcje: Wybór poziomu trudności.
- Propsy:
  - `value: string | null` - aktualna wartość
  - `onChange: (value: string | null) => void` - obsługa zmian

### FlashcardsList
- Opis komponentu: Lista utworzonych fiszek w bieżącej sesji.
- Główne elementy: Lista kart z podglądem fiszek (front i back).
- Obsługiwane interakcje: Kliknięcie na fiszkę może otworzyć jej edycję.
- Propsy:
  - `flashcards: FormFlashcard[]` - lista fiszek
  - `onSelectForEdit: (index: number) => void` - obsługa wyboru do edycji

## 5. Typy
```typescript
// Reprezentacja fiszki w formularzu
interface FormFlashcard {
  id: string; // tymczasowe ID w formularzu
  front: string;
  back: string;
  category_id: string | null;
  category_name: string | null;
  difficulty: "easy" | "medium" | "hard" | null;
  errors?: {
    front?: string;
    back?: string;
    category?: string;
  };
}

// Stan formularza dodawania fiszek
interface AddFlashcardsFormState {
  flashcards: FormFlashcard[];
  isSubmitting: boolean;
  submitError: string | null;
  successMessage: string | null;
}

// Stan selektora kategorii
interface CategorySelectorState {
  isAddingNew: boolean;
  newCategoryName: string;
  selectedCategoryId: string | null;
}

// Payload do zapisania fiszek
interface SaveFlashcardsPayload {
  flashcards: CreateFlashcardCommand[];
}

// Odpowiedź z API po zapisie
interface SaveFlashcardsResponse {
  data: FlashcardDTO[];
  failed: { index: number; error: string }[];
}
```

## 6. Zarządzanie stanem
Do zarządzania stanem formularza wykorzystamy hooki React:

1. **useAddFlashcardsForm** - główny hook do zarządzania stanem formularza
   ```typescript
   function useAddFlashcardsForm() {
     const [formState, setFormState] = useState<AddFlashcardsFormState>({
       flashcards: [createEmptyFlashcard()], // zaczynamy od jednej pustej fiszki
       isSubmitting: false,
       submitError: null,
       successMessage: null
     });
     
     // Funkcje do zarządzania fiszkami i zapisem
     
     return {
       formState,
       addFlashcard,
       removeFlashcard,
       updateFlashcard,
       saveAllFlashcards,
       resetForm
     };
   }
   ```

2. **useCategoriesLoader** - hook do pobierania i zarządzania kategoriami
   ```typescript
   function useCategoriesLoader() {
     const [categories, setCategories] = useState<FlashcardCategory[]>([]);
     const [isLoading, setIsLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     
     // Logika pobierania kategorii z API
     
     return { categories, isLoading, error };
   }
   ```

## 7. Integracja API
Formularz będzie korzystał z endpointu POST `/api/flashcards` aby zapisać utworzone fiszki:

```typescript
async function saveFlashcards(flashcards: FormFlashcard[]): Promise<SaveFlashcardsResponse> {
  // Przygotowanie danych zgodnie z API
  const payload: SaveFlashcardsPayload = {
    flashcards: flashcards.map(flashcard => ({
      front: flashcard.front,
      back: flashcard.back,
      is_ai_generated: false,
      category_id: flashcard.category_id || undefined,
      category_name: flashcard.category_name || undefined,
      difficulty: flashcard.difficulty || undefined
    }))
  };

  // Wywołanie API
  const response = await fetch('/api/flashcards', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Nie udało się zapisać fiszek');
  }

  return await response.json();
}
```

Dodatkowo, pobieranie kategorii będzie wykorzystywać endpoint GET `/api/categories`.

## 8. Interakcje użytkownika
1. **Dodawanie nowej fiszki**
   - Użytkownik klika przycisk "Dodaj fiszkę"
   - System dodaje nowy pusty formularz fiszki
   - Użytkownik może wypełnić pola nowej fiszki

2. **Usuwanie fiszki**
   - Użytkownik klika przycisk usunięcia przy wybranej fiszce
   - System usuwa fiszkę z formularza
   - Jeśli to ostatnia fiszka, system uniemożliwia jej usunięcie

3. **Edycja treści fiszki**
   - Użytkownik wprowadza tekst w pola front/back
   - System aktualizuje stan formularza i waliduje wprowadzone dane
   - System informuje o przekroczeniu limitu znaków

4. **Wybór kategorii**
   - Użytkownik wybiera istniejącą kategorię z listy rozwijanej
   - LUB
   - Użytkownik przełącza na tryb "Dodaj nową kategorię"
   - Użytkownik wprowadza nazwę nowej kategorii

5. **Wybór trudności**
   - Użytkownik wybiera poziom trudności z listy rozwijanej (łatwy, średni, trudny)

6. **Zapisywanie fiszek**
   - Użytkownik klika przycisk "Zapisz wszystkie fiszki"
   - System waliduje wszystkie fiszki
   - System wyświetla błędy walidacji lub wysyła dane do API
   - System informuje o powodzeniu/niepowodzeniu operacji
   - W przypadku sukcesu, system może zaproponować utworzenie kolejnych fiszek lub przejście do biblioteki

## 9. Warunki i walidacja
### Walidacja formularza
1. **Front fiszki**
   - Wymagane pole
   - Maksymalna długość: 200 znaków
   - Komunikat błędu: "Treść przedniej strony jest wymagana" lub "Maksymalna długość to 200 znaków"

2. **Back fiszki**
   - Wymagane pole
   - Maksymalna długość: 500 znaków
   - Komunikat błędu: "Treść tylnej strony jest wymagana" lub "Maksymalna długość to 500 znaków"

3. **Kategoria**
   - Opcjonalne pole
   - Przy dodawaniu nowej kategorii, nazwa jest wymagana
   - Komunikat błędu: "Nazwa kategorii jest wymagana"

4. **Trudność**
   - Opcjonalne pole
   - Wartość musi być jedną z: "easy", "medium", "hard" lub null

### Stan formularza i feedback
- Formularz nie może być pusty (minimum jedna fiszka)
- Przycisk zapisu jest aktywny tylko gdy wszystkie wymagane pola są wypełnione
- Podczas zapisywania wyświetlany jest stan ładowania
- Po zapisie wyświetlany jest komunikat sukcesu lub błędu
- Błędy walidacji są wyświetlane przy odpowiednich polach

## 10. Obsługa błędów
1. **Błędy walidacji lokalnej**
   - Błędy są wyświetlane bezpośrednio przy polach formularza
   - Przycisk zapisu jest nieaktywny gdy są błędy walidacji

2. **Błędy API**
   - Błąd pobierania kategorii: Wyświetlane jest powiadomienie toast i domyślna pusta lista
   - Błąd zapisu fiszek: Wyświetlany jest komunikat błędu nad przyciskiem zapisu
   - Błędy sieciowe: Obsługa przez try/catch z odpowiednim komunikatem

3. **Obsługa częściowego sukcesu**
   - Jeśli niektóre fiszki zostały zapisane, a inne nie (zwrócone w `failed`), 
     system informuje użytkownika o częściowym sukcesie i oznacza problematyczne fiszki

## 11. Kroki implementacji
1. Utworzenie pliku strony Astro pod ścieżką `/flashcards/add.astro`
2. Utworzenie aliasu ścieżki `/create` w konfiguracji routingu
3. Implementacja komponentu FlashcardsAddForm (React)
   - Szkielet formularza z zarządzaniem stanem
   - Obsługa dodawania i usuwania fiszek
   - Integracja z API
4. Implementacja komponentu FlashcardEditor
   - Pola formularza dla front i back
   - Obsługa walidacji
5. Implementacja FlashcardCategorySelector
   - Pobieranie kategorii z API
   - Obsługa dodawania nowych kategorii
6. Implementacja FlashcardDifficultySelector
7. Implementacja listy utworzonych fiszek
8. Testy funkcjonalne formularza
9. Testy integracji z API
10. Optymalizacja UX i obsługi błędów 