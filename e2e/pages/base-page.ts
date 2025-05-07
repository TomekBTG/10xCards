import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

/**
 * Bazowa klasa dla wszystkich klas Page Object
 * Implementuje wzorzec Page Object Model dla testów E2E
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Przechodzi do podanej ścieżki URL
   */
  async goto(path = "/"): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Oczekuje na załadowanie strony
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Sprawdza, czy element jest widoczny
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  /**
   * Wykonuje zrzut ekranu i weryfikuje go
   */
  async verifyScreenshot(name: string, options?: any): Promise<void> {
    console.log("verifyScreenshot", name, options);
    await expect(this.page).toHaveScreenshot(`${name}.png`, options);
  }

  /**
   * Pobiera tekst z elementu
   */
  async getText(locator: Locator): Promise<string> {
    return (await locator.textContent()) || "";
  }

  /**
   * Klika w element
   */
  async click(locator: Locator): Promise<void> {
    await locator.click();
  }

  /**
   * Wpisuje tekst do elementu
   */
  async fill(locator: Locator, text: string): Promise<void> {
    await locator.fill(text);
  }
}
