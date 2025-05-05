# Testowanie w 10xCards

Ten dokument zawiera informacje na temat strategii testowania, narzędzi i wytycznych dla projektu 10xCards.

## Struktura testów

- **Testy jednostkowe** - zlokalizowane obok plików które testują z rozszerzeniem `.test.ts` lub `.test.tsx`
- **Testy E2E** - zlokalizowane w katalogu `e2e/` z rozszerzeniem `.spec.ts`

## Narzędzia testowe

### Testy jednostkowe (Vitest)

Używamy Vitest jako głównego narzędzia do testów jednostkowych ze względu na jego integrację z Vite i wydajność.

Najważniejsze funkcje:
- Integracja z React Testing Library
- Mockowanie komponentów i funkcji
- Pomiar pokrycia kodu
- Tryb watch do szybkiego iterowania
- Interfejs graficzny do przeglądania wyników

### Testy E2E (Playwright)

Używamy Playwright do kompleksowych testów end-to-end.

Najważniejsze funkcje:
- Testy działają na prawdziwej przeglądarce Chrome
- Automatyczne zrzuty ekranu i nagrywanie wideo
- Page Object Model dla utrzymywalności testów
- Izolowane konteksty przeglądarki dla każdego testu
- Wsparcie dla generowania testów przez codegen

## Uruchamianie testów

### Testy jednostkowe

```bash
# Uruchom wszystkie testy jednostkowe
npm test

# Uruchom testy w trybie watch (dla rozwoju)
npm run test:watch

# Uruchom testy z interfejsem graficznym
npm run test:ui

# Uruchom testy z pomiarem pokrycia kodu
npm run test:coverage
```

### Testy E2E

```bash
# Uruchom wszystkie testy E2E
npm run test:e2e

# Uruchom testy E2E z interfejsem graficznym
npm run test:e2e:ui

# Uruchom testy E2E w trybie debug
npm run test:e2e:debug

# Uruchom generator testów Playwright
npm run test:e2e:codegen

# Screenshots
npx playwright test e2e/navigation.spec.ts --update-snapshots
```

## Wytyczne dla testów jednostkowych

1. **Struktura testów**:
   - Używaj `describe` do grupowania powiązanych testów
   - Używaj `it` dla pojedynczych przypadków testowych
   - Używaj `beforeEach` i `afterEach` do wspólnego kodu setup/teardown

2. **Mockowanie**:
   - Używaj `vi.fn()` dla funkcji mockujących
   - Używaj `vi.spyOn()` do monitorowania istniejących funkcji
   - Używaj `vi.mock()` dla modułów

3. **Testy komponentów React**:
   - Testuj zachowanie, a nie implementację
   - Używaj selektorów dostępności (getByRole, getByLabelText) zamiast testid, gdy to możliwe
   - Testuj interakcje użytkownika za pomocą `userEvent` zamiast `fireEvent`

4. **Asercje**:
   - Używaj czytelnych asercji, które jasno komunikują intencję testu
   - Preferuj bardziej szczegółowe asercje nad zbyt ogólnymi

## Wytyczne dla testów E2E

1. **Page Object Model**:
   - Wszystkie interakcje ze stroną powinny być obsługiwane przez klasy Page Object
   - Każda strona powinna mieć własną klasę dziedziczącą po BasePage
   - Page Objects powinny ukrywać szczegóły implementacji selektorów

2. **Selektory**:
   - Używaj atrybutów `data-testid` dla elementów, które nie mają unikalnych cech dostępności
   - Używaj selektorów, które są odporne na zmiany wizualne

3. **Testy wizualne**:
   - Używaj `expect(page).toHaveScreenshot()` do testów wizualnych
   - Aktualizuj złote zrzuty ekranu przy zamierzonych zmianach wyglądu

4. **Debugowanie**:
   - Używaj `--debug` do interaktywnego debugowania testów
   - Sprawdzaj nagrania wideo testów, które nie powiodły się

## CI/CD

Testy są automatycznie uruchamiane w pipeline CI/CD:
- Testy jednostkowe są uruchamiane dla każdego pull requesta
- Testy E2E są uruchamiane dla każdego pull requesta do gałęzi main
- Testy z pomiarem pokrycia kodu są uruchamiane okresowo 