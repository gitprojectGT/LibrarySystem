import { test, expect } from '../fixtures/test-helpers.js';
import { CREDENTIALS,BOOK_DATA, TIMEOUTS } from '../fixtures/test-data.js';

test.describe('Book Deletion Tests', () => {
  test.beforeEach(async ({ page, authHelper, bookActions }) => {
    try {
      // Login before each test
      await authHelper.login(CREDENTIALS.VALID.USERNAME, CREDENTIALS.VALID.PASSWORD);
      await page.waitForLoadState(TIMEOUTS.DOM_CONTENT_LOADED);
      await bookActions.navigateToBooks();
    } catch (error) {
      console.error('BeforeEach failed:', error);
      throw error;
    }
  });

  test('should delete a book successfully', async ({ page, bookActions, assertions }) => {
    // Create a book first
    await bookActions.openAddBookDialog();

    const bookData = BOOK_DATA.TO_DELETE_BOOK;
  
    await bookActions.fillBookForm(bookData);
    await bookActions.submitBookForm();
    await page.waitForTimeout(1000);

    // Verify book exists
    await assertions.verifyBookInList(bookData.title);

    // Delete the book
    await bookActions.deleteBook(bookData.title);
  
    await page.waitForTimeout(1000);

    // Verify book is deleted
    await assertions.verifyBookNotInList(bookData.title);
  });
});
