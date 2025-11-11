import { expect, Page, Locator } from '@playwright/test';
import { SELECTORS, URL_PATTERNS, TIMEOUTS } from '../fixtures/test-data';

/**
 * Assertion helpers for Library System tests
 */
export class Assertions {
  constructor(private page: Page) {}

  /**
   * Verify successful login and dashboard is visible
   */
  async verifyDashboardLoaded() {
    console.log('Verifying dashboard loaded...' + this.page.url());

    await expect(this.page).toHaveURL(URL_PATTERNS.BOOKS_PAGE);
    await this.page.waitForLoadState(TIMEOUTS.NETWORK_IDLE);
  }



  /**
   * Verify book exists in the list
   */
  async verifyBookInList(bookTitle: string) {
    // Enhanced selector strategies with multiple approaches for book discovery
    const selectors = [
      // Direct text matching (most reliable)
      `text="${bookTitle}"`,
      `text=${bookTitle}`,
      // Table-specific selectors (for tabular book lists)
      `td:has-text("${bookTitle}")`,
      `th:has-text("${bookTitle}")`,
      // Generic container selectors
      `div:has-text("${bookTitle}")`,
      `span:has-text("${bookTitle}")`,
      `p:has-text("${bookTitle}")`,
      // Attribute-based selectors
      `[title*="${bookTitle}"]`,
      `[aria-label*="${bookTitle}"]`,
      // Data attributes 
      `[data-title*="${bookTitle}"]`,
      `[data-book-title*="${bookTitle}"]`,
      // Book-specific class selectors
      '.book-title:has-text("' + bookTitle + '")',
      '.book-name:has-text("' + bookTitle + '")',
      '.title:has-text("' + bookTitle + '")',
    ];

    let bookFound = false;
    for (const selector of selectors) {
      const bookLocator = this.page.locator(selector).first();
      const count = await bookLocator.count();
      if (count > 0) {
        try {
          await expect(bookLocator).toBeVisible({ timeout: 5000 });
          bookFound = true;
          break;
        } catch (error) {
          // Continue to next selector
          continue;
        }
      }
    }

    if (!bookFound) {
      throw new Error(`Book "${bookTitle}" not found in list using any of the selector strategies`);
    }
  }

  /**
   * Verify book does not exist in the list
   */
  async verifyBookNotInList(bookTitle: string) {
    const bookLocator = this.page.locator(`text=${bookTitle}`);
    await expect(bookLocator).not.toBeVisible();
  }



  /**
   * Verify validation error messages are displayed
   */
  async verifyValidationErrors(expectedErrors: string[]) {
    // Wait for errors to appear
    await this.page.waitForTimeout(500);

    for (const expectedError of expectedErrors) {
      let errorFound = false;
      
      for (const selector of SELECTORS.VALIDATION_ERROR) {
        const errorElements = this.page.locator(selector);
        const count = await errorElements.count();
        
        for (let i = 0; i < count; i++) {
          const errorText = await errorElements.nth(i).textContent();
          if (errorText && errorText.toLowerCase().includes(expectedError.toLowerCase())) {
            await expect(errorElements.nth(i)).toBeVisible();
            errorFound = true;
            break;
          }
        }
        
        if (errorFound) break;
      }
      
      if (!errorFound) {
        // Also check for the error text anywhere on the page
        const pageErrorLocator = this.page.locator(`text=${expectedError}`);
        if (await pageErrorLocator.count() > 0) {
          await expect(pageErrorLocator.first()).toBeVisible();
          errorFound = true;
        }
      }
      
      if (!errorFound) {
        throw new Error(`Expected error "${expectedError}" not found on page`);
      }
    }
  }

}
