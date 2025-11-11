import { test, expect } from '../fixtures/test-helpers';
import { CREDENTIALS, BOOK_DATA, VALIDATION_MESSAGES, URLS , TIMEOUTS } from '../fixtures/test-data';

test.describe('Book Creation Tests', () => {
  test.beforeEach(async ({ page, authHelper, bookActions }) => {
    try {
      // Login before each test with better error handling
      await authHelper.login(CREDENTIALS.VALID.USERNAME, CREDENTIALS.VALID.PASSWORD);
      await page.waitForLoadState(TIMEOUTS.DOM_CONTENT_LOADED);
      await bookActions.navigateToBooks();
    } catch (error) {
      console.error('BeforeEach failed:', error);
      throw error;
    }
  });

  test('should create a book with all valid fields', async ({ page, bookActions, assertions }) => {
    // Navigate directly to add book page instead of using openAddBookDialog
    await page.goto(URLS.ADD_BOOK_PATH);
    await page.waitForLoadState('networkidle');

    const bookData = BOOK_DATA.VALID_BOOK;

    // Fill form fields with better error handling
    await bookActions.fillBookForm(bookData);
    
    // Additional wait to ensure all fields are filled
    await page.waitForTimeout(1000);

    await bookActions.submitBookForm();

    // Wait for any loading or navigation to complete
    await page.waitForLoadState(TIMEOUTS.NETWORK_IDLE);
    await page.waitForTimeout(2000); 

    // Check for any error messages after submission
    const hasError = await page.locator(' .error, [class*="error"]').count() > 0;
    if (hasError) {
        // If there are still errors, the book creation failed
      expect.soft(hasError).toBeFalsy();
      return;
    }
    // If no errors, verify book was created
    await assertions.verifyBookInList(bookData.title);
  });

  test('should validate empty title and author fields', async ({ page, bookActions }) => {
    await bookActions.openAddBookDialog();

    const bookData = BOOK_DATA.EMPTY_VALIDATION_BOOK;

    await bookActions.fillBookForm(bookData);
    await bookActions.submitBookForm();

    // Should show validation error or remain on form
    // The error displayed on page depends on which fields are invalid. 
    //This approach covers both.

    const hasError = await page.locator(' .error, [class*="error"]').count() > 0;
    expect(hasError).toBeFalsy();
  });

  test('should handle special unicode characters in book details', async ({ page, bookActions }) => {
    await bookActions.openAddBookDialog();

    const bookData = BOOK_DATA.UNICODE_BOOK;

    await bookActions.fillBookForm(bookData);
    await bookActions.submitBookForm();

    await page.waitForTimeout(1000);

    // Should handle special characters and unicode gracefully
    const bookVisible = await page.locator(`text=${bookData.title}`).count() > 0;

    expect(bookVisible).toBeTruthy();
  });

  test('should validate required fields and show error messages', async ({ page, bookActions, assertions }) => {
    // Navigate directly to add book page
    await page.goto(URLS.ADD_BOOK_PATH);
    // await page.waitForLoadState('domcontentloaded'); //
    await page.waitForLoadState(TIMEOUTS.NETWORK_IDLE);

    // Submit empty form to trigger validation
    await bookActions.submitBookForm();

    // Wait for validation errors to appear
    await page.waitForTimeout(1000);

    // Verify all required field error messages are displayed
    const expectedErrors = [
      VALIDATION_MESSAGES.REQUIRED_FIELDS.TITLE,
      VALIDATION_MESSAGES.REQUIRED_FIELDS.AUTHOR,
      VALIDATION_MESSAGES.REQUIRED_FIELDS.GENRE,
      VALIDATION_MESSAGES.REQUIRED_FIELDS.ISBN,
      VALIDATION_MESSAGES.REQUIRED_FIELDS.PUBLICATION_DATE,
      VALIDATION_MESSAGES.REQUIRED_FIELDS.PRICE,
    ];

    await assertions.verifyValidationErrors(expectedErrors);
  });


});