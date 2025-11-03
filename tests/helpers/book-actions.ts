import { Page } from '@playwright/test';
import { SELECTORS, FORM_FIELDS, TIMEOUTS } from '../fixtures/test-data';

/**
 * Book-related action helpers
 */
export class BookActions {
  constructor(private page: Page) {}

  /**
   * Navigate to books page
   */
  async navigateToBooks() {
    for (const selector of SELECTORS.BOOKS_LINK) {
      if (await this.page.locator(selector).count() > 0) {
        await this.page.locator(selector).first().click();
        await this.page.waitForLoadState(TIMEOUTS.NETWORK_IDLE);
        return;
      }
    }
  }

  /**
   * Open add book dialog/form
   */
  async openAddBookDialog() {
    for (const selector of SELECTORS.ADD_BOOK_BUTTON) {
      if (await this.page.locator(selector).count() > 0) {
        await this.page.locator(selector).first().click();
        await this.page.waitForTimeout(500); // Wait for dialog animation
        return;
      }
    }
  }

  /**
   * Fill book form
   */
  async fillBookForm(bookData: {
    title?: string;
    author?: string;
    isbn?: string;
    genre?: string;
    publicationDate?: string;
    price?: string;
  }) {
    if (bookData.title) {
      await this.fillField('title', bookData.title);
    }
    if (bookData.author) {
      await this.fillField('author', bookData.author);
    }
    if (bookData.isbn) {
      await this.fillField('isbn', bookData.isbn);
    }
    if (bookData.genre) {
      await this.fillField('genre', bookData.genre);
    }
    if (bookData.publicationDate) {
      await this.fillField(['publicationDate', 'publication-date', 'date'], bookData.publicationDate);
    }
    if (bookData.price) {
      await this.fillField('price', bookData.price);
    }
  }

  /**
   * Helper to fill a field by multiple possible names
   */
  private async fillField(fieldName: string | string[], value: string) {
    const fieldNames = Array.isArray(fieldName) ? fieldName : [fieldName];

    for (const name of fieldNames) {
      const selectors = FORM_FIELDS.getFieldSelectors(name);

      for (const selector of selectors) {
        const element = this.page.locator(selector).first();
        if (await element.count() > 0) {
          const tagName = await element.evaluate(el => el.tagName.toLowerCase());
          
          if (tagName === 'select') {
            await element.selectOption({ label: value });
          } else {
            await element.fill(value);
          }
          return;
        }
      }
    }
    
    // If field not found, log for debugging
    console.log(`Field "${fieldNames.join('|')}" not found with value "${value}"`);
  }

  /**
   * Submit book form
   */
  async submitBookForm() {
    for (const selector of SELECTORS.SUBMIT_BUTTON) {
      if (await this.page.locator(selector).count() > 0) {
        await this.page.locator(selector).first().click();
        await this.page.waitForLoadState(TIMEOUTS.NETWORK_IDLE);
        return;
      }
    }
  }

  /**
   * Search for a book
   */
  async searchBook(query: string) {
    for (const selector of SELECTORS.SEARCH_INPUT) {
      if (await this.page.locator(selector).count() > 0) {
        await this.page.locator(selector).first().fill(query);
        await this.page.waitForTimeout(500); // Wait for search results
        return;
      }
    }
  }

  /**
   * Find book row by title
   */
  async findBookRow(title: string) {
    const selectors = SELECTORS.BOOK_ROW(title);
    return this.page.locator(selectors.join(', ')).first();
  }

  /**
   * Edit a book by title
   */
  async editBook(title: string) {
    const bookRow = await this.findBookRow(title);
    const editButton = bookRow.locator(SELECTORS.EDIT_BUTTON.join(', ')).first();
    await editButton.click();
    await this.page.waitForTimeout(500); // Wait for dialog
  }

  /**
   * Delete a book by title
   */
  async deleteBook(title: string) {
    const bookRow = await this.findBookRow(title);
    const deleteButton = bookRow.locator(SELECTORS.DELETE_BUTTON.join(', ')).first();
    await deleteButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Confirm delete action
   */
  async confirmDelete() {
    for (const selector of SELECTORS.CONFIRM_DELETE_BUTTON) {
      if (await this.page.locator(selector).count() > 0) {
        await this.page.locator(selector).first().click();
        await this.page.waitForLoadState(TIMEOUTS.NETWORK_IDLE);
        return;
      }
    }
  }

  /**
   * Get book count from the page
   */
  async getBookCount(): Promise<number> {
    const rows = this.page.locator(SELECTORS.TABLE_ROWS.join(', '));
    await this.page.waitForTimeout(500);
    return await rows.count();
  }
}
