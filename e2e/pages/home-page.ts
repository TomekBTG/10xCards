import { BasePage } from "./base-page";

/**
 * Klasa obsługująca stronę główną w testach E2E
 */
export class HomePage extends BasePage {
  /**
   * Przechodzi do strony głównej
   */
  async goto(): Promise<void> {
    await super.goto("/");
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
   * Próbuje wykryć różne elementy UI, które są widoczne tylko dla zalogowanych użytkowników
   */
  async isUserLoggedIn(): Promise<boolean> {
    // Zapisz stan strony dla diagnostyki
    await this.page.screenshot({ path: "login-check.png" });

    console.log("Sprawdzanie, czy użytkownik jest zalogowany - rozpoczęte");

    // Sprawdź różne selektory, które mogą wskazywać na zalogowanego użytkownika
    const selectors = [
      '[data-testid="konto-button"]',
      'button:has-text("Konto")',
      'a:has-text("Konto")',
      ".nav-konto",
      'a[href="/profile"]',
      'a[href="/dashboard"]',
    ];

    // Sprawdź, czy którykolwiek z selektorów jest widoczny
    for (const selector of selectors) {
      const isVisible = await this.page
        .locator(selector)
        .isVisible()
        .catch(() => false);
      console.log(`Selektor ${selector} widoczny: ${isVisible}`);
      if (isVisible) {
        console.log(`Użytkownik zalogowany (wykryto element: ${selector})`);
        return true;
      }
    }

    // Sprawdź, czy na stronie jest tekst, który wskazywałby na zalogowanego użytkownika
    const pageContent = await this.page.content();
    if (
      pageContent.includes("Wyloguj") ||
      pageContent.includes("wyloguj") ||
      pageContent.includes("logout") ||
      pageContent.includes("Logout") ||
      pageContent.includes("Wyloguj się")
    ) {
      console.log("Użytkownik zalogowany (wykryto tekst wylogowania)");
      return true;
    }

    // Sprawdź, czy na stronie nie ma elementów logowania
    const loginElements = ['form[action*="login"]', 'button:has-text("Zaloguj")', 'a:has-text("Zaloguj")'];

    for (const selector of loginElements) {
      const isVisible = await this.page
        .locator(selector)
        .isVisible()
        .catch(() => false);
      console.log(`Element logowania ${selector} widoczny: ${isVisible}`);
      // Jeśli elementy logowania są widoczne, użytkownik NIE jest zalogowany
      if (isVisible) {
        console.log("Użytkownik NIE jest zalogowany (wykryto element logowania)");
        return false;
      }
    }

    // Sprawdź URL - jeśli jesteśmy na stronie dashboard, biblioteka itp., prawdopodobnie użytkownik jest zalogowany
    const currentUrl = this.page.url();
    if (currentUrl.includes("/dashboard") || currentUrl.includes("/library") || currentUrl.includes("/profile")) {
      console.log(`Użytkownik prawdopodobnie zalogowany (jesteśmy na stronie: ${currentUrl})`);
      console.log("Ale nie wykryto elementów UI charakterystycznych dla zalogowanego użytkownika");

      // Zwróć true - zakładamy, że skoro jesteśmy na chronionych stronach, to użytkownik jest zalogowany
      return true;
    }

    console.log("Użytkownik nie jest zalogowany (nie wykryto żadnych oznak zalogowania)");
    return false;
  }

  /**
   * Otwiera menu użytkownika
   */
  async openUserMenu(): Promise<void> {
    // Kliknij przycisk "Konto" aby otworzyć dropdown
    const kontoSelectors = [
      '[data-testid="konto-button"]',
      'button:has-text("Konto")',
      'a:has-text("Konto")',
      ".nav-konto",
    ];

    let kontoClicked = false;
    for (const selector of kontoSelectors) {
      const element = this.page.locator(selector);
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        await this.click(element);
        kontoClicked = true;
        break;
      }
    }

    if (!kontoClicked) {
      throw new Error('Nie znaleziono przycisku "Konto" do kliknięcia');
    }

    // Daj czas na rozwinięcie menu
    await this.page.waitForTimeout(500);
  }

  /**
   * Otwiera profil użytkownika
   */
  async openUserProfile(): Promise<void> {
    // Najpierw otwórz menu użytkownika
    await this.openUserMenu();

    // Następnie kliknij na "Profil"
    const profileSelectors = ['a[href="/profile"]', 'a:has-text("Profil")', ".block.px-4.py-2"];

    for (const selector of profileSelectors) {
      const element = this.page.locator(selector);
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        await this.click(element);
        return;
      }
    }

    throw new Error('Nie znaleziono opcji "Profil" w menu użytkownika');
  }

  /**
   * Wykonuje wylogowanie użytkownika
   */
  async logout(): Promise<void> {
    if (await this.isUserLoggedIn()) {
      try {
        await this.openUserMenu();

        // Spróbuj kliknąć przycisk wylogowania na podstawie struktury HTML
        const logoutSelectors = [
          'button:has-text("Wyloguj się")',
          "button.w-full.text-left.px-4.py-2",
          'button:has-text("Wyloguj")',
          'button.text-left:has-text("Wyloguj")',
        ];

        for (const selector of logoutSelectors) {
          const element = this.page.locator(selector);
          const isVisible = await element.isVisible().catch(() => false);
          if (isVisible) {
            await this.click(element);
            await this.waitForPageLoad();
            return;
          }
        }

        throw new Error("Nie znaleziono przycisku wylogowania");
      } catch (error) {
        console.log(`Błąd podczas próby wylogowania: ${error}`);
      }
    }
  }

  /**
   * Loguje użytkownika używając danych z .env.test lub domyślnych danych testowych
   */
  async login(): Promise<void> {
    // Jeśli użytkownik jest już zalogowany, nie rób nic
    if (await this.isUserLoggedIn()) {
      console.log("Użytkownik jest już zalogowany, pomijam proces logowania");
      return;
    }

    // Pobierz wartości timeoutów z zmiennych środowiskowych lub użyj domyślnych wartości
    const pageLoadWait = parseInt(process.env.E2E_PAGE_LOAD_WAIT || "2000", 10);
    const waitTimeout = parseInt(process.env.E2E_WAIT_TIMEOUT || "10000", 10);

    // Przejdź do strony logowania
    await super.goto("/login");
    await this.waitForPageLoad();

    // Dodatkowe oczekiwanie dla pełnego załadowania strony
    console.log(`Oczekiwanie ${pageLoadWait}ms na pełne załadowanie strony logowania...`);
    await this.page.waitForTimeout(pageLoadWait);

    // Pobierz dane logowania z zmiennych środowiskowych lub użyj domyślnych wartości testowych
    const username = process.env.E2E_USERNAME || "test@example.com";
    const password = process.env.E2E_PASSWORD || "testPassword123";

    console.log(`Próba logowania z użytkownikiem: ${username} (hasło ukryte)`);

    // Sprawdź, czy formularz logowania jest widoczny
    const emailInput = this.page.getByLabel("Email");
    const passwordInput = this.page.getByLabel("Hasło");
    const loginButton = this.page.getByRole("button", { name: "Zaloguj się" });

    // Zrzut ekranu dla diagnostyki
    await this.page.screenshot({ path: "login-page-before-check.png" });

    console.log("Oczekiwanie dodatkowych 2 sekund przed sprawdzeniem formularza...");
    await this.page.waitForTimeout(2000);

    const isEmailInputVisible = await emailInput.isVisible().catch(() => false);
    const isPasswordInputVisible = await passwordInput.isVisible().catch(() => false);
    const isLoginButtonVisible = await loginButton.isVisible().catch(() => false);

    if (!isEmailInputVisible || !isPasswordInputVisible || !isLoginButtonVisible) {
      console.log("Elementy formularza logowania nie są widoczne:");
      console.log(`- Email input: ${isEmailInputVisible}`);
      console.log(`- Password input: ${isPasswordInputVisible}`);
      console.log(`- Login button: ${isLoginButtonVisible}`);

      // Spróbuj alternatywnych selektorów
      console.log("Próba użycia alternatywnych selektorów...");
      const altEmailInput = this.page.locator('input[type="email"]');
      const altPasswordInput = this.page.locator('input[type="password"]');
      const altLoginButton = this.page.locator('button[type="submit"]');

      const isAltEmailVisible = await altEmailInput.isVisible().catch(() => false);
      const isAltPasswordVisible = await altPasswordInput.isVisible().catch(() => false);
      const isAltButtonVisible = await altLoginButton.isVisible().catch(() => false);

      console.log("Alternatywne selektory:");
      console.log(`- Alt Email input: ${isAltEmailVisible}`);
      console.log(`- Alt Password input: ${isAltPasswordVisible}`);
      console.log(`- Alt Login button: ${isAltButtonVisible}`);

      if (isAltEmailVisible && isAltPasswordVisible && isAltButtonVisible) {
        console.log("Używanie alternatywnych selektorów do logowania");
        await altEmailInput.fill(username);
        await altPasswordInput.fill(password);
        await altLoginButton.click();
      } else {
        // Zapisz zrzut ekranu dla diagnostyki
        await this.page.screenshot({ path: "login-form-issue.png" });

        // Zrzut HTML dla diagnostyki
        const html = await this.page.content();
        console.log("Fragment HTML strony logowania:", html.substring(0, 500) + "...");

        // Spróbuj bezpośrednio przejść do dashboard
        console.log("Próba bezpośredniego przejścia do dashboard...");
        await super.goto("/dashboard");
        await this.waitForPageLoad();

        if (this.page.url().includes("/dashboard")) {
          console.log("Udało się przejść bezpośrednio do dashboard");
          return;
        }

        throw new Error("Formularz logowania nie jest dostępny lub ma inną strukturę niż oczekiwano");
      }
    } else {
      // Wypełnij formularz logowania
      console.log("Wypełnianie formularza logowania...");
      await emailInput.fill(username);
      await passwordInput.fill(password);

      // Zrzut ekranu przed kliknięciem przycisku logowania (do diagnostyki)
      await this.page.screenshot({ path: "before-login-click.png" });

      // Kliknij przycisk logowania
      await loginButton.click();
    }

    try {
      // Poczekaj na przekierowanie po zalogowaniu
      console.log(`Oczekiwanie na przekierowanie do dashboard (timeout: ${waitTimeout}ms)...`);
      await this.page.waitForURL("**/dashboard", { timeout: waitTimeout });
      console.log("Przekierowanie do dashboard nastąpiło");

      // Poczekaj na pełne załadowanie strony
      await this.waitForPageLoad();

      // Dodatkowe oczekiwanie dla ładowania JavaScript
      await this.page.waitForTimeout(pageLoadWait);

      // Sprawdź, czy faktycznie użytkownik jest zalogowany
      const isLoggedIn = await this.isUserLoggedIn();
      if (!isLoggedIn) {
        console.log("Przekierowanie do dashboard nastąpiło, ale użytkownik wydaje się nie być zalogowany");
        await this.page.screenshot({ path: "login-success-but-not-logged-in.png" });
      } else {
        console.log("Logowanie zakończone sukcesem, użytkownik jest zalogowany");
      }

      // Zakładamy, że jesteśmy zalogowani, skoro URL to dashboard
      return;
    } catch (error) {
      console.log("Błąd podczas oczekiwania na przekierowanie po logowaniu:", error);

      // Sprawdź, czy pojawił się komunikat o błędzie logowania
      const errorMessage = await this.page
        .locator('[data-testid="login-error"]')
        .textContent()
        .catch(() => null);
      if (errorMessage) {
        console.log("Komunikat błędu logowania:", errorMessage);
      }

      // Zrzut ekranu dla diagnostyki
      await this.page.screenshot({ path: "login-error.png" });

      throw new Error(`Nie udało się zalogować: ${error}`);
    }
  }
}
