/**
 * Test helpers fixtures for Library System E2E tests
 * Provides reusable helper instances for authentication, book actions, and assertions
 */

import { test as base, Page } from '@playwright/test';
import { AuthHelper } from '../helpers/auth';
import { BookActions } from '../helpers/book-actions';
import { Assertions } from '../helpers/assertions';

// Define the test helpers type
type TestHelpers = {
  authHelper: AuthHelper;
  bookActions: BookActions;
  assertions: Assertions;
};

/**
 * Extended test fixture that provides helper instances
 * Usage: import { test, expect } from '../fixtures/test-helpers';
 */
export const test = base.extend<TestHelpers>({
  /**
   * AuthHelper fixture - provides authentication helper methods
   */
  authHelper: async ({ page }: { page: Page }, use: (r: AuthHelper) => Promise<void>) => {
    const authHelper = new AuthHelper(page);
    await use(authHelper);
  },

  /**
   * BookActions fixture - provides book management helper methods
   */
  bookActions: async ({ page }: { page: Page }, use: (r: BookActions) => Promise<void>) => {
    const bookActions = new BookActions(page);
    await use(bookActions);
  },

  /**
   * Assertions fixture - provides custom assertion helper methods
   */
  assertions: async ({ page }: { page: Page }, use: (r: Assertions) => Promise<void>) => {
    const assertions = new Assertions(page);
    await use(assertions);
  },
});

// Re-export expect from Playwright for convenience
export { expect } from '@playwright/test';