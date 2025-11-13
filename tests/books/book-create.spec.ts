import { test, expect } from '../fixtures/test-helpers.js';

test.describe('Book Creation Tests', () => {
  test.beforeEach(async ({ page, authHelper, bookActions, testData }) => {
    try {
      // Login before each test with better error handling
      const credentials = testData.getValidCredentials();
      await authHelper.login(credentials.username, credentials.password);
      await page.waitForLoadState(testData.getTimeouts().domContentLoaded);
      await bookActions.navigateToBooks();
    } catch (error) {
      console.error('BeforeEach failed:', error);
      throw error;
    }
  });

  test('should create a book with all valid fields', async ({ page, bookActions, assertions, testData }) => {
    // Navigate directly to add book page instead of using openAddBookDialog
    await page.goto(testData.getUrls().addBookPath);
    await page.waitForLoadState(testData.getTimeouts().domContentLoaded);

    // Use generated data instead of static data to ensure uniqueness
    const bookData = testData.generateBook({
      genre: 'Fiction', // Ensure we use a valid genre
      price: '25.99'
    });

    // Fill form fields with better error handling
    await bookActions.fillBookForm(bookData);
    
    // Additional wait to ensure all fields are filled
    await page.waitForTimeout(1000);

    await bookActions.submitBookForm();

    // Wait for any loading or navigation to complete
    await page.waitForLoadState(testData.getTimeouts().domContentLoaded);
    await page.waitForTimeout(2000); 

    // Check for any error messages after submission
    const hasError = await page.locator(' .error, [class*="error"]').count() > 0;
    if (hasError) {
        // If there are still errors, the book creation failed
      expect.soft(hasError).toBeFalsy();
      return;
    }
    // If no errors, verify book was created
    // Wait a bit more for the book to appear in the list
    await page.waitForTimeout(2000);
    
    // Check for success message or book presence
    const successMessage = await page.locator('.success, .alert-success, [class*="success"]').count();
    if (successMessage > 0) {
      console.log('Success message detected - book creation confirmed');
    }
    
    await assertions.verifyBookInList(bookData.title);
  });

  test('should validate empty title and author fields', async ({ page, bookActions, testData }) => {
    await bookActions.openAddBookDialog();

    const bookData = testData.getBookForScenario('empty');

    await bookActions.fillBookForm(bookData);
    await bookActions.submitBookForm();

    // Wait for validation errors to appear
    await page.waitForTimeout(2000);

    // Try multiple selectors for error messages
    const errorSelectors = [
      '.error',
      '[class*="error"]',
      '.validation-error',
      '.field-error',
      '.input-error',
      '.alert-danger',
      '.text-danger',
      '[role="alert"]',
      '.invalid-feedback'
    ];

    let hasError = false;
    for (const selector of errorSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        hasError = true;
        break;
      }
    }

    // Also check if form is still visible (didn't submit due to validation)
    const formStillVisible = await bookActions.isAddBookDialogOpen();
    
    expect(hasError || formStillVisible).toBeTruthy();
  });

  test('should handle special unicode characters in book details', async ({ page, bookActions, testData }) => {
    await bookActions.openAddBookDialog();

    const bookData = testData.getBookForScenario('unicode');

    await bookActions.fillBookForm(bookData);
    await bookActions.submitBookForm();

    await page.waitForTimeout(1000);

    // Should handle special characters and unicode gracefully
    const bookVisible = await page.locator(`text=${bookData.title}`).count() > 0;

    expect(bookVisible).toBeTruthy();
  });

  test('should validate required fields and show error messages', async ({ page, bookActions, assertions, testData }) => {
    // Navigate directly to add book page
    await page.goto(testData.getUrls().addBookPath);
    await page.waitForLoadState(testData.getTimeouts().domContentLoaded);

    // Submit empty form to trigger validation
    await bookActions.submitBookForm();

    // Wait for validation errors to appear
    await page.waitForTimeout(1000);

    // Verify all required field error messages are displayed
    const validationMessages = testData.getValidationMessages().requiredFields;
    const expectedErrors = [
      validationMessages.title,
      validationMessages.author,
      validationMessages.genre,
      validationMessages.isbn,
      validationMessages.publicationDate,
      validationMessages.price,
    ];

    await assertions.verifyValidationErrors(expectedErrors);
  });


});
