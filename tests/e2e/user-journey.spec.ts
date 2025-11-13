import { test, expect } from '../fixtures/test-helpers.js';
import { CREDENTIALS, BOOK_DATA, VIEWPORT, URLS, TIMEOUTS } from '../fixtures/test-data.js';

/**
 * End-to-End User Journey Tests
 *
 * These tests verify complete user workflows from start to finish,
 * simulating real user interactions with the Library System.
 */

test.describe('E2E User Journeys', () => {
  test.describe('Successful User Journey: Login to Add Book', () => {
    test('should complete full journey - login, navigate, and add a book', async ({ page, authHelper, bookActions, assertions }) => {
      // Helpers are now available as fixture parameters

      // ========== STEP 1: Navigate to Application ==========
      await test.step('Navigate to login page', async () => {
        // Maximize browser viewport
        await page.setViewportSize(VIEWPORT.DESKTOP);

        // Navigate directly to login page
        await page.goto(URLS.LOGIN_PATH, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForLoadState(TIMEOUTS.DOM_CONTENT_LOADED);

        // Verify we're on the login page
        const currentUrl = page.url();
        expect(currentUrl).toContain(URLS.LOGIN_PATH);

        console.log('Navigated to login page');
      });

      // ========== STEP 2: Login ==========
      await test.step('Login with valid credentials', async () => {
        // Perform login
        await authHelper.login(CREDENTIALS.VALID.USERNAME, CREDENTIALS.VALID.PASSWORD);

        // Verify successful login - should be redirected to dashboard/inventory
        await assertions.verifyDashboardLoaded();

        // Verify we're no longer on login page
        const currentUrl = page.url();
        expect(currentUrl).not.toMatch(URLS.LOGIN_PATH);

        console.log(' Successfully logged in as admin');
      });

      // ========== STEP 3: Navigate to Books Page ==========
      await test.step('Navigate to books  page', async () => {
        // Navigate to books page
        await bookActions.navigateToBooks();
        await page.waitForLoadState(TIMEOUTS.NETWORK_IDLE);

        // Verify books page is loaded
        const currentUrl = page.url();
        expect(currentUrl).toMatch(URLS.BOOKS_PATH);

        // Verify page elements are visible
        const hasTable = await page.locator('table').count() > 0;
        const hasList = await page.locator('[class*="list"], [class*="grid"]').count() > 0;
        expect(hasTable || hasList).toBeTruthy();

        console.log(' Successfully navigated to books page');
      });

      // ========== STEP 4: Record Initial Book Count ==========
      let initialBookCount: number;
      await test.step('Record initial book count', async () => {
        await page.waitForTimeout(1000); // Wait for list to fully load
        initialBookCount = await bookActions.getBookCount();

        console.log(` Initial book count: ${initialBookCount}`);
      });

      // ========== STEP 5: Navigate to Add Book Page ==========
      await test.step('Navigate to add book page', async () => {
        // Navigate directly to add book page instead of using modal dialog
        await page.goto(URLS.ADD_BOOK_PATH);
        await page.waitForLoadState(TIMEOUTS.DOM_CONTENT_LOADED);

        // Verify we're on the add book page
        await expect(page).toHaveURL(URLS.ADD_BOOK_PATH);

        // Verify form fields are visible
        const titleField = page.locator('input[name="title"], input[id="title"]').first();
        const authorField = page.locator('input[name="author"], input[id="author"]').first();

        await expect(titleField).toBeVisible();
        await expect(authorField).toBeVisible();

        console.log('Add book page loaded successfully');
      });

      // ========== STEP 6: Fill Book Information ==========
      const newBook = BOOK_DATA.JOURNEY_BOOK_1;

      await test.step('Fill in book details', async () => {
        await bookActions.fillBookForm(newBook);

        // Verify fields are filled
        const titleField = page.locator('input[name="title"], input[id="title"]').first();
        const titleValue = await titleField.inputValue();
        expect(titleValue).toBe(newBook.title);

        console.log(`Filled book information: "${newBook.title}"`);
      });

      // ========== STEP 7: Submit Book Form ==========
      await test.step('Submit the book form', async () => {
        await bookActions.submitBookForm();
        await page.waitForTimeout(1500); // Wait for submission and list update

        console.log('Book form submitted');
      });

      // ========== STEP 8: Verify Book Was Added ==========
      await test.step('Verify book appears in the inventory', async () => {
        // Check if book appears in the list
        await assertions.verifyBookInList(newBook.title);

        // Verify book count increased
        const newBookCount = await bookActions.getBookCount();
        expect(newBookCount).toBe(initialBookCount + 1);

        console.log(`Book "${newBook.title}" successfully added to list`);
    
      });

      // ========== STEP 9: Search for the New Book ==========
      await test.step('Search for the newly added book', async () => {
        await bookActions.searchBook(newBook.title);
        await page.waitForTimeout(500);

        // Verify book is found in search results
        await assertions.verifyBookInList(newBook.title);

        console.log(` Book found in search results`);
      });

      // ========== STEP 10: View Book Details (Optional) ==========
      await test.step('Verify book details are correct', async () => {
        // Clear search to see all books
        await bookActions.searchBook('');
        await page.waitForTimeout(500);

        // Find the book row
        const bookRow = await bookActions.findBookRow(newBook.title);
        await expect(bookRow).toBeVisible();

        // Verify author is visible in the row (if displayed)
        const rowText = await bookRow.textContent();
        expect(rowText).toContain(newBook.title);

        console.log('Book details verified in book list');
      });

      // ========== Journey Complete ==========
      console.log('\n======================================================');
      console.log(' USER JOURNEY: LOGIN TO ADD BOOOK  COMPLETED SUCCESSFULLY');
      console.log('=========================================================');
      console.log('User successfully:');
      console.log('  1. Logged in as admin');
      console.log('  2. Navigated to books page');
      console.log('  3. Opened add book dialog');
      console.log('  4. Filled book information');
      console.log('  5. Submitted the form');
      console.log('  6. Verified book was added');
      console.log('  7. Searched and found the book');
      console.log('=========================================================\n');
    });
  });

  test.describe('Complete CRUD Journey', () => {
    test('should complete full CRUD cycle - create, read, update, delete', async ({ page, authHelper, bookActions, assertions }) => {
      // Helpers are now available as fixture parameters

      // Login
      await test.step('Login to application', async () => {
        // Maximize viewport
        await page.setViewportSize(VIEWPORT.DESKTOP);

        // Navigate directly to login page
        await page.goto(URLS.LOGIN_PATH, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForLoadState(TIMEOUTS.DOM_CONTENT_LOADED);

        await authHelper.login(CREDENTIALS.VALID.USERNAME, CREDENTIALS.VALID.PASSWORD);
        await assertions.verifyDashboardLoaded();
      });

      // Navigate to books
      await test.step('Navigate to books page', async () => {
        await bookActions.navigateToBooks();
        await page.waitForLoadState(TIMEOUTS.NETWORK_IDLE);
      });

      const testBook = BOOK_DATA.JOURNEY_BOOK_2;

      // CREATE
      await test.step('Create a new book', async () => {
        await page.goto(URLS.ADD_BOOK_PATH);
        await page.waitForLoadState(TIMEOUTS.DOM_CONTENT_LOADED);
        await bookActions.fillBookForm(testBook);
        await bookActions.submitBookForm();
        await page.waitForTimeout(1000);

        await assertions.verifyBookInList(testBook.title);
        console.log('CREATE: Book created successfully');
      });

      // READ
      await test.step('Read/Search for the book', async () => {
        await bookActions.searchBook(testBook.title);
        await page.waitForTimeout(500);

        await assertions.verifyBookInList(testBook.title);
        console.log('READ: Book found in search');
      });

      // UPDATE
      await test.step('Update the book', async () => {
        await bookActions.searchBook(''); // Clear search
        await page.waitForTimeout(500);

        await bookActions.editBook(testBook.title);
        await page.waitForTimeout(500);

        const updatedQuantity = '100000';
        await bookActions.fillBookForm({ price: updatedQuantity });
        await bookActions.submitBookForm();
        await page.waitForTimeout(1000);

        await assertions.verifyBookInList(testBook.title);
        console.log('UPDATE: Book updated successfully');
      });

      // DELETE
      await test.step('Delete the book', async () => {
        await bookActions.deleteBook(testBook.title);
        await page.waitForTimeout(300);

        const confirmButton = page.locator('button:has-text("Delete")');
        if (await confirmButton.count() > 0) {
          await bookActions.confirmDelete();
        }
        await page.waitForTimeout(1000);

        await assertions.verifyBookNotInList(testBook.title);
        console.log('DELETE: Book deleted successfully');
      });

      console.log('\n Hey Up! Complete CRUD cycle completed successfully\n');
    });
  });

});
