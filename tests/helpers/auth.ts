import { Page } from '@playwright/test';
import { SELECTORS, TIMEOUTS, VIEWPORT, URLS } from '../fixtures/test-data';

/**
 * Authentication helper for managing login state
 */
export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Perform login with credentials
   */
  async login(username: string, password: string) {
    // Maximize browser viewport
    await this.page.setViewportSize(VIEWPORT.DESKTOP);

    // Navigate directly to login page
    await this.page.goto(URLS.LOGIN_PATH);

    // Wait for the app to load
    await this.page.waitForLoadState(TIMEOUTS.NETWORK_IDLE);

    // Find and fill username field using centralized selectors
    const usernameSelectors = SELECTORS.USERNAME_FIELD;

    for (const selector of usernameSelectors) {
      if (await this.page.locator(selector).count() > 0) {
        await this.page.locator(selector).first().fill(username);
        break;
      }
    }

    // Find and fill password field
    await this.page.locator(SELECTORS.PASSWORD_FIELD).first().fill(password);

    // Find and click login button using centralized selectors
    const loginButtonSelectors = SELECTORS.LOGIN_BUTTON;

    for (const selector of loginButtonSelectors) {
      if (await this.page.locator(selector).count() > 0) {
        await this.page.locator(selector).first().click();
        break;
      }
    }

    // Wait for navigation after login
    await this.page.waitForLoadState(TIMEOUTS.NETWORK_IDLE);
  }

  /**
   * Logout from the application
   */
  async logout() {
    const logoutSelectors = [
      'button:has-text("Logout")',
      'button:has-text("Sign out")', //TO DO: verify these selectors
      'a:has-text("Logout")',
      'a:has-text("Sign out")', //TO DO: verify these selectors
      '[class*="logout"]',
    ];

    for (const selector of logoutSelectors) {
      if (await this.page.locator(selector).count() > 0) {
        await this.page.locator(selector).first().click();
        break;
      }
    }

    await this.page.waitForLoadState(TIMEOUTS.NETWORK_IDLE);
  }
}
