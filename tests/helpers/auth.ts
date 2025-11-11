import { Page } from '@playwright/test';
import { SELECTORS, TIMEOUTS, VIEWPORT, URLS } from '../fixtures/test-data';

/**
 * Authentication helper for managing login state
 */
export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Perform login with credentials with enhanced error handling and retry logic
   */
  async login(username: string, password: string) {
    console.log(`Attempting login with username: ${username}`);
    
    // Maximize browser viewport
    await this.page.setViewportSize(VIEWPORT.DESKTOP);

    // Navigate directly to login page with retry logic
    let navigationSuccess = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Navigation attempt ${attempt} to login page`);
        await this.page.goto(URLS.LOGIN_PATH, { waitUntil: 'domcontentloaded', timeout: 15000 });
        
        // Wait for the page to stabilize
        await this.page.waitForTimeout(2000);
        
        // Check if we're on a login page
        const currentUrl = this.page.url();
        console.log(`Current URL: ${currentUrl}`);
        
        if (currentUrl.includes('login') || currentUrl === URLS.BASE_URL || currentUrl === URLS.BASE_URL + '/') {
          navigationSuccess = true;
          break;
        }
      } catch (error) {
        console.log(`Navigation attempt ${attempt} failed: ${error instanceof Error ? error.message : String(error)}`);
        if (attempt < 3) {
          await this.page.waitForTimeout(3000); // Wait before retry
        }
      }
    }

    if (!navigationSuccess) {
      throw new Error('Failed to navigate to login page after 3 attempts');
    }

    // Find and fill username field using centralized selectors with timeout
    console.log('Looking for username field...');
    const usernameSelectors = SELECTORS.USERNAME_FIELD;
    let usernameFieldFound = false;

    for (const selector of usernameSelectors) {
      try {
        const element = this.page.locator(selector).first();
        await element.waitFor({ state: 'visible', timeout: 5000 });
        if (await element.count() > 0) {
          console.log(` Found username field with selector: ${selector}`);
          await element.clear();
          await element.fill(username);
          usernameFieldFound = true;
          break;
        }
      } catch (error) {
        console.log(` Username selector failed: ${selector}`);
        continue;
      }
    }

    if (!usernameFieldFound) {
      throw new Error('Username field not found with any selector');
    }

    // Find and fill password field with enhanced error handling
    console.log(' Looking for password field...');
    try {
      const passwordElement = this.page.locator(SELECTORS.PASSWORD_FIELD).first();
      await passwordElement.waitFor({ state: 'visible', timeout: 5000 });
      console.log(' Found password field');
      await passwordElement.clear();
      await passwordElement.fill(password);
    } catch (error) {
      throw new Error(`Password field not found or not fillable: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Find and click login button using centralized selectors
    console.log(' Looking for login button...');
    const loginButtonSelectors = SELECTORS.LOGIN_BUTTON;
    let loginButtonFound = false;

    for (const selector of loginButtonSelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.count() > 0) {
          await element.waitFor({ state: 'visible', timeout: 3000 });
          console.log(` Found login button with selector: ${selector}`);
          await element.click();
          loginButtonFound = true;
          break;
        }
      } catch (error) {
        console.log(` Login button selector failed: ${selector}`);
        continue;
      }
    }

    if (!loginButtonFound) {
      throw new Error('Login button not found with any selector');
    }

    // Wait for navigation after login with timeout
    console.log(' Waiting for login to complete...');
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      await this.page.waitForTimeout(2000);
      
      const finalUrl = this.page.url();
      console.log(` Login completed. Final URL: ${finalUrl}`);
    } catch (error) {
      console.log(` Login may have completed but with timeout: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Logout from the application
   */
  async logout() {
    const logoutSelectors = [
      'button:has-text("Logout")',
      'button:has-text("Sign out")',
      'button:has-text("Log out")',
      'a:has-text("Logout")',
      'a:has-text("Sign out")',
      'a:has-text("Log out")',
      '[class*="logout"]',
      '[data-testid*="logout"]',
      'button[id*="logout"]',
      'a[id*="logout"]',
    ];

    for (const selector of logoutSelectors) {
      if (await this.page.locator(selector).count() > 0) {
        await this.page.locator(selector).first().click();
        break;
      }
    }

    await this.page.waitForLoadState(TIMEOUTS.DOM_CONTENT_LOADED);
  }
}
