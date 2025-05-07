import type { Locator } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Klasa obsługująca stronę dodawania fiszek w testach E2E
 */
export class FlashcardsAddPage extends BasePage {
  // Lokatory do elementów na stronie
  readonly frontInputSelector = [
    '[data-testid="flashcard-front-input"]',
    'textarea[placeholder*="Wpisz treść przedniej strony"]',
    'textarea[placeholder*="przedni"]',
    "textarea:first-of-type",
  ];
  readonly backInputSelector = [
    '[data-testid="flashcard-back-input"]',
    'textarea[placeholder*="Wpisz treść tylnej strony"]',
    'textarea[placeholder*="tylnej"]',
    "textarea:nth-of-type(2)",
  ];
  readonly categorySelector = [
    '[data-testid="category-selector"]',
    'button:has-text("Wybierz kategorię")',
    'div[role="combobox"]',
  ];
  readonly difficultySelectorEasy = [
    '[data-testid="difficulty-easy"]',
    'button:has-text("Easy")',
    'button:has-text("Łatwy")',
  ];
  readonly difficultySelectorMedium = [
    '[data-testid="difficulty-medium"]',
    'button:has-text("Medium")',
    'button:has-text("Średni")',
  ];
  readonly difficultySelectorHard = [
    '[data-testid="difficulty-hard"]',
    'button:has-text("Hard")',
    'button:has-text("Trudny")',
  ];
  readonly addFlashcardButton = [
    '[data-testid="add-flashcard-button"]',
    'button:has-text("Dodaj fiszkę")',
    'button:has-text("Add flashcard")',
  ];
  readonly saveAllButton = [
    '[data-testid="save-all-button"]',
    'button:has-text("Zapisz wszystkie")',
    'button:has-text("Save all")',
  ];
  readonly flashcardsList = ['[data-testid="flashcards-list"]', ".flashcards-list"];
  readonly flashcardItems = ['[data-testid="flashcard-item"]', ".flashcard-item"];

  /**
   * Przechodzi do strony dodawania fiszek
   */
  async goto(): Promise<void> {
    await super.goto("/flashcards/add");
    await this.waitForPageLoad();

    // Zapisz zrzut ekranu dla diagnostyki
    await this.page.screenshot({ path: "flashcards-add-page.png" });

    // Sprawdź, czy strona załadowała się poprawnie, skanując jej zawartość
    console.log("Sprawdzanie, czy strona dodawania fiszek załadowała się poprawnie");

    // Zbierz informacje o treści strony
    const pageTitle = await this.page.title();
    const currentUrl = this.page.url();

    console.log(`Tytuł strony: ${pageTitle}`);
    console.log(`URL: ${currentUrl}`);

    // Sprawdź czy URL zawiera oczekiwaną ścieżkę
    if (!currentUrl.includes("/flashcards/add")) {
      console.log(`Ostrzeżenie: URL strony (${currentUrl}) nie zawiera '/flashcards/add'`);
    }

    // Spróbuj zidentyfikować elementy formularza
    await this.diagnoseFormElements();
  }

  /**
   * Diagnozuje obecność elementów formularza na stronie
   */
  async diagnoseFormElements(): Promise<void> {
    console.log("Diagnozowanie elementów formularza:");

    // Sprawdź różne potencjalne selektory dla pól formularza
    const elementLists = {
      "Pole przedniej strony": this.frontInputSelector,
      "Pole tylnej strony": this.backInputSelector,
      "Selektor kategorii": this.categorySelector,
      "Przycisk trudności (łatwy)": this.difficultySelectorEasy,
      "Przycisk trudności (średni)": this.difficultySelectorMedium,
      "Przycisk trudności (trudny)": this.difficultySelectorHard,
      "Przycisk dodania fiszki": this.addFlashcardButton,
      "Przycisk zapisu wszystkich fiszek": this.saveAllButton,
    };

    for (const [elementName, selectors] of Object.entries(elementLists)) {
      for (const selector of selectors) {
        const isVisible = await this.page
          .locator(selector)
          .isVisible()
          .catch(() => false);
        if (isVisible) {
          console.log(`${elementName} znalezione (selektor: ${selector})`);
          break;
        } else if (selectors.indexOf(selector) === selectors.length - 1) {
          console.log(`Ostrzeżenie: ${elementName} nie znalezione`);
        }
      }
    }

    // Sprawdź zawartość strony dla kluczowych fraz
    const pageContent = await this.page.content();
    const keyPhrases = [
      "Dodaj fiszkę",
      "Add flashcard",
      "Zapisz wszystkie",
      "Save all",
      "Kategoria",
      "Category",
      "Trudność",
      "Difficulty",
    ];

    for (const phrase of keyPhrases) {
      if (pageContent.includes(phrase)) {
        console.log(`Fraza "${phrase}" znaleziona na stronie`);
      }
    }
  }

  /**
   * Znajduje widoczny element z listy selektorów
   */
  async findVisibleElement(selectors: string[]): Promise<Locator | null> {
    for (const selector of selectors) {
      const element = this.page.locator(selector);
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        return element;
      }
    }

    return null;
  }

  /**
   * Wprowadza treść przedniej strony fiszki
   */
  async fillFrontContent(text: string, index = 0): Promise<void> {
    const element = await this.findVisibleElement(this.frontInputSelector);
    if (!element) {
      console.error("Nie znaleziono pola przedniej strony fiszki");
      await this.page.screenshot({ path: "missing-front-input.png" });
      throw new Error("Nie znaleziono pola przedniej strony fiszki");
    }

    await element.nth(index).fill(text);
  }

  /**
   * Wprowadza treść tylnej strony fiszki
   */
  async fillBackContent(text: string, index = 0): Promise<void> {
    const element = await this.findVisibleElement(this.backInputSelector);
    if (!element) {
      console.error("Nie znaleziono pola tylnej strony fiszki");
      await this.page.screenshot({ path: "missing-back-input.png" });
      throw new Error("Nie znaleziono pola tylnej strony fiszki");
    }

    await element.nth(index).fill(text);
  }

  /**
   * Wybiera kategorię fiszki
   */
  async selectCategory(categoryName: string, index = 0): Promise<void> {
    const element = await this.findVisibleElement(this.categorySelector);
    if (!element) {
      console.error("Nie znaleziono selektora kategorii");
      await this.page.screenshot({ path: "missing-category-selector.png" });
      throw new Error("Nie znaleziono selektora kategorii");
    }

    await element.nth(index).click();
    await this.page.getByText(categoryName, { exact: false }).first().click();
  }

  /**
   * Wybiera poziom trudności fiszki
   */
  async selectDifficulty(difficulty: "easy" | "medium" | "hard", index = 0): Promise<void> {
    let selectors: string[];

    switch (difficulty) {
      case "easy":
        selectors = this.difficultySelectorEasy;
        break;
      case "medium":
        selectors = this.difficultySelectorMedium;
        break;
      case "hard":
        selectors = this.difficultySelectorHard;
        break;
      default:
        throw new Error(`Nieprawidłowy poziom trudności: ${difficulty}`);
    }

    const element = await this.findVisibleElement(selectors);
    if (!element) {
      console.error(`Nie znaleziono przycisku trudności (${difficulty})`);
      await this.page.screenshot({ path: `missing-difficulty-${difficulty}.png` });
      throw new Error(`Nie znaleziono przycisku trudności (${difficulty})`);
    }

    await element.nth(index).click();
  }

  /**
   * Dodaje nową pustą fiszkę
   */
  async addNewFlashcard(): Promise<void> {
    const element = await this.findVisibleElement(this.addFlashcardButton);
    if (!element) {
      console.error("Nie znaleziono przycisku dodawania fiszki");
      await this.page.screenshot({ path: "missing-add-button.png" });
      throw new Error("Nie znaleziono przycisku dodawania fiszki");
    }

    await this.click(element);
  }

  /**
   * Zapisuje wszystkie fiszki
   */
  async saveAllFlashcards(): Promise<void> {
    const element = await this.findVisibleElement(this.saveAllButton);
    if (!element) {
      console.error("Nie znaleziono przycisku zapisywania fiszek");
      await this.page.screenshot({ path: "missing-save-button.png" });
      throw new Error("Nie znaleziono przycisku zapisywania fiszek");
    }

    await this.click(element);

    // Czekaj na zakończenie zapisu (zazwyczaj toast sukcesu)
    try {
      await this.page.waitForSelector('[data-testid="toast-success"]', { timeout: 5000 });
    } catch (error) {
      console.log("Nie znaleziono komunikatu sukcesu po zapisie");
      console.log(error);
    }
  }

  /**
   * Wypełnia kompletną fiszkę wszystkimi danymi
   */
  async fillCompleteFlashcard(
    front: string,
    back: string,
    category: string,
    difficulty: "easy" | "medium" | "hard",
    index = 0
  ): Promise<void> {
    await this.fillFrontContent(front, index);
    await this.fillBackContent(back, index);
    await this.selectCategory(category, index);
    await this.selectDifficulty(difficulty, index);
  }

  /**
   * Sprawdza, czy fiszka o podanym indeksie zawiera oczekiwane dane
   */
  async verifyFlashcardContent(index: number, expectedFront: string, expectedBack: string): Promise<boolean> {
    const element = await this.findVisibleElement(this.flashcardItems);
    if (!element) {
      console.error("Nie znaleziono elementów fiszek");
      await this.page.screenshot({ path: "missing-flashcard-items.png" });
      return false;
    }

    const frontContent = await element.nth(index).locator(".front-content").textContent();
    const backContent = await element.nth(index).locator(".back-content").textContent();

    return (frontContent?.includes(expectedFront) && backContent?.includes(expectedBack)) || false;
  }

  /**
   * Pobiera liczbę fiszek na liście
   */
  async getFlashcardsCount(): Promise<number> {
    const element = await this.findVisibleElement(this.flashcardItems);
    if (!element) {
      console.error("Nie znaleziono elementów fiszek");
      await this.page.screenshot({ path: "missing-flashcard-items.png" });
      return 0;
    }

    return await element.count();
  }
}
