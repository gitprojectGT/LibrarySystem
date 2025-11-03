import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth';
import { BookActions } from '../helpers/book-actions';
import { Assertions } from '../helpers/assertions';
import { CREDENTIALS,BOOK_DATA, TIMEOUTS } from '../fixtures/test-data';

test.describe('Book Deletion Tests', () => {
  let authHelper: AuthHelper;
  let bookActions: BookActions;
  let assertions: Assertions;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    bookActions = new BookActions(page);
    assertions = new Assertions(page);

    // Login before each test
    await authHelper.login(CREDENTIALS.VALID.USERNAME, CREDENTIALS.VALID.PASSWORD);
    await page.waitForLoadState(TIMEOUTS.NETWORK_IDLE);
    await bookActions.navigateToBooks();
  });

  test('should delete a book successfully', async ({ page }) => {
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
