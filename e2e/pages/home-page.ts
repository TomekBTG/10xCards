import type { Page } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Klasa obsługująca stronę główną w testach E2E
 */
export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Przechodzi do strony głównej
   */
  async goto(): Promise<void> {
    await super.goto('/');
    await this.waitForPageLoad();
  }

  /**
   * Pobiera tytuł strony głównej
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Sprawdza, czy użytkownik jest zalogowany
   */
  async isUserLoggedIn(): Promise<boolean> {
    return await this.isVisible(this.page.locator('[data-testid="user-menu"]'));
  }

  /**
   * Otwiera menu użytkownika
   */
  async openUserMenu(): Promise<void> {
    await this.click(this.page.locator('[data-testid="user-menu"]'));
  }

  /**
   * Wykonuje wylogowanie użytkownika
   */
  async logout(): Promise<void> {
    if (await this.isUserLoggedIn()) {
      await this.openUserMenu();
      await this.click(this.page.locator('[data-testid="logout-button"]'));
      await this.waitForPageLoad();
    }
  }
} 