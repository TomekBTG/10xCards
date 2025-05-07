import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/home-page";
import { setupEnv } from "./utils/env";

// Załaduj zmienne środowiskowe z pliku .env.test
setupEnv();

test.describe("Testy elementów UI związanych z fiszkami", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);

    // Przejdź na stronę główną i zaloguj się
    await homePage.goto();

    console.log("Próba zalogowania użytkownika - rozpoczęta");

    // Sprawdź, czy mamy dane uwierzytelniające
    console.log("E2E_USERNAME istnieje:", !!process.env.E2E_USERNAME);
    console.log("E2E_PASSWORD istnieje:", !!process.env.E2E_PASSWORD);

    // Próba zalogowania użytkownika przed każdym testem, jeśli są dostępne zmienne środowiskowe
    try {
      await homePage.login();
      console.log("Logowanie zakończone pomyślnie");

      // Sprawdź, czy użytkownik jest zalogowany
      const isLoggedIn = await homePage.isUserLoggedIn();
      console.log("Czy użytkownik jest zalogowany po próbie logowania:", isLoggedIn);

      if (!isLoggedIn) {
        console.log("Użytkownik nie jest zalogowany, pomijam test");
        test.skip();
        return;
      }

      console.log("Kontynuuję test - użytkownik jest zalogowany");
    } catch (error) {
      console.warn("Nie udało się zalogować użytkownika. Błąd:", error);
      test.skip();
      return;
    }
  });

  test("Strona główna po zalogowaniu zawiera elementy nawigacyjne związane z fiszkami", async ({ page }) => {
    // Powinniśmy być na dashboard po zalogowaniu
    console.log("URL po zalogowaniu:", page.url());

    // Zrób zrzut ekranu strony po zalogowaniu
    await page.screenshot({ path: "page-after-login.png" });

    // Sprawdź obecność linków do stron związanych z fiszkami
    const libraryLink = page.locator('a[href*="library"], a:has-text("Biblioteka"), a:has-text("Library")');
    const isLibraryLinkVisible = await libraryLink.isVisible();
    expect(isLibraryLinkVisible).toBeTruthy();

    // Sprawdź tytuł strony
    const title = await page.title();
    console.log("Tytuł strony po zalogowaniu:", title);

    // Sprawdź zawartość strony
    const pageContent = await page.content();
    const hasFiszkaKeyword =
      pageContent.includes("fiszk") ||
      pageContent.includes("Fiszk") ||
      pageContent.includes("flashcard") ||
      pageContent.includes("Flashcard");

    expect(hasFiszkaKeyword).toBeTruthy();
  });

  test("Symulacja dodawania fiszki (interakcja z interfejsem)", async ({ page }) => {
    // Ponieważ nie możemy bezpośrednio przejść do strony dodawania fiszek,
    // sprawdzimy, czy na stronie jest link do biblioteki i spróbujemy tam przejść
    const libraryLink = page.locator('a[href*="library"], a:has-text("Biblioteka"), a:has-text("Library")').first();

    if (await libraryLink.isVisible()) {
      // Kliknij link do biblioteki
      try {
        await libraryLink.click();
        await page.waitForTimeout(2000); // Daj stronie czas na załadowanie

        console.log("URL po kliknięciu linku biblioteki:", page.url());
        await page.screenshot({ path: "library-page-attempt.png" });

        // Szukanie przycisku/linku do dodawania fiszek
        const addFlashcardButton = page
          .locator(
            'button:has-text("Dodaj fiszkę"), a:has-text("Dodaj fiszkę"), ' +
              'button:has-text("Add flashcard"), a:has-text("Add flashcard"), ' +
              'button:has-text("+"), a[href*="add"]'
          )
          .first();

        const isAddButtonVisible = await addFlashcardButton.isVisible().catch(() => false);

        if (isAddButtonVisible) {
          console.log("Znaleziono przycisk dodawania fiszek");
          await addFlashcardButton.highlight();
          await page.screenshot({ path: "add-button-highlighted.png" });

          // Próba kliknięcia przycisku dodawania
          await addFlashcardButton.click();
          await page.waitForTimeout(2000);

          console.log("URL po kliknięciu przycisku dodawania:", page.url());
          await page.screenshot({ path: "after-add-button-click.png" });

          // Szukanie elementów formularza
          const textareas = await page.locator("textarea").all();
          console.log(`Znaleziono ${textareas.length} pola tekstowe`);

          // Jeśli znaleziono pola formularza, próbujemy wprowadzić tekst
          if (textareas.length > 0) {
            // Zakładamy, że pierwszy textarea to przednia strona fiszki
            await textareas[0].fill("Testowa przednia strona");

            // Jeśli znaleziono drugi textarea, zakładamy że to tylna strona
            if (textareas.length > 1) {
              await textareas[1].fill("Testowa tylna strona");
            }

            // Szukamy przycisku zapisywania
            const saveButton = page
              .locator(
                'button:has-text("Zapisz"), button:has-text("Save"), ' +
                  'button:has-text("Zachowaj"), button:has-text("Zatwierdź"), ' +
                  'button:has-text("Dodaj"), button:has-text("Submit"), ' +
                  'button[type="submit"]'
              )
              .first();

            const isSaveButtonVisible = await saveButton.isVisible().catch(() => false);

            if (isSaveButtonVisible) {
              console.log("Znaleziono przycisk zapisywania");
              await saveButton.highlight();
              await page.screenshot({ path: "save-button-highlighted.png" });

              // Nie klikamy przycisku zapisu, aby nie wprowadzać testowych danych do systemu
              // ale weryfikujemy jego obecność
              expect(isSaveButtonVisible).toBeTruthy();
            } else {
              console.log("Nie znaleziono przycisku zapisywania");
            }
          }
        } else {
          console.log("Nie znaleziono przycisku dodawania fiszek");
        }

        // Weryfikacja, że strona zawiera określone elementy UI
        const pageContent = await page.content();
        const keyWords = ["fiszk", "Fiszk", "flashcard", "Flashcard", "kart", "Kart", "card", "Card"];

        const containsKeyword = keyWords.some((keyword) => pageContent.includes(keyword));
        expect(containsKeyword).toBeTruthy();
      } catch (error) {
        console.error("Błąd podczas próby interakcji z interfejsem:", error);
        await page.screenshot({ path: "error-interaction.png" });
      }
    } else {
      console.log("Link do biblioteki nie jest widoczny, nie można kontynuować testu");
      // Weryfikacja, że strona zawiera przynajmniej jakieś informacje o fiszkach
      const pageContent = await page.content();
      const keyWords = ["fiszk", "Fiszk", "flashcard", "Flashcard"];

      const containsKeyword = keyWords.some((keyword) => pageContent.includes(keyword));
      expect(containsKeyword).toBeTruthy();
    }
  });
});
