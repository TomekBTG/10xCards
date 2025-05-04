import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home-page';

test.describe('Testy nawigacji po stronie', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('Strona główna ładuje się poprawnie', async () => {
    // Sprawdź tytuł strony
    const title = await homePage.getPageTitle();
    expect(title).toContain('10xCards');
    
    // Zrzut ekranu strony głównej
    await homePage.verifyScreenshot('home-page');
  });

  test('Użytkownik może nawigować po stronie', async ({ page }) => {
    // Zakładamy, że na stronie głównej są linki do innych sekcji
    
    // Kliknij link do sekcji "Biblioteka"
    await page.locator('a:has-text("Biblioteka")').click();
    await page.waitForURL('**/library');
    
    // Sprawdź, czy URL zawiera '/library'
    expect(page.url()).toContain('/library');
    
    // Kliknij link do sekcji "Dashboard"
    await page.locator('a:has-text("Dashboard")').click();
    await page.waitForURL('**/dashboard');
    
    // Sprawdź, czy URL zawiera '/dashboard'
    expect(page.url()).toContain('/dashboard');
  });

  test('Menu użytkownika działa poprawnie', async ({ page }) => {
    // Ten test wymaga, aby użytkownik był już zalogowany
    // W środowisku rzeczywistym należałoby dodać logikę logowania
    
    // Sprawdź, czy menu użytkownika jest widoczne
    const isLoggedIn = await homePage.isUserLoggedIn();
    
    if (isLoggedIn) {
      // Otwórz menu użytkownika
      await homePage.openUserMenu();
      
      // Sprawdź, czy menu zawiera odpowiednie opcje
      expect(await page.locator('[data-testid="user-dropdown"]').isVisible()).toBeTruthy();
      
      // Opcjonalnie: wyloguj użytkownika
      // await homePage.logout();
      // expect(await homePage.isUserLoggedIn()).toBeFalsy();
    } else {
      // Jeśli użytkownik nie jest zalogowany, test powinien być pominięty
      test.skip();
    }
  });
}); 