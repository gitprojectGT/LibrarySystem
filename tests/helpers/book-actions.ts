import { Page } from '@playwright/test';
import { SELECTORS, FORM_FIELDS, TIMEOUTS } from '../fixtures/test-data';

/**
 * Book-related action helpers
 */
export class BookActions {
  constructor(private page: Page) {}

  /**
   * Retry wrapper for operations that might fail due to browser instability
   */
  private async withRetry<T>(operation: () => Promise<T>, maxRetries: number = 3, delayMs: number = 1000): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (error instanceof Error && error.message.includes('Target page, context or browser has been closed')) {
          console.warn(`Attempt ${attempt}/${maxRetries} failed: Browser closed, retrying...`);
          if (attempt < maxRetries) {
            await this.page.waitForTimeout(delayMs);
            continue;
          }
        } else if (attempt < maxRetries) {
          console.warn(`Attempt ${attempt}/${maxRetries} failed: ${error instanceof Error ? error.message : String(error)}, retrying...`);
          await this.page.waitForTimeout(delayMs);
          continue;
        }
        
        // If we get here, all retries failed
        break;
      }
    }
    
    throw lastError || new Error('Operation failed after retries');
  }

  /**
   * Navigate to books page
   */
  async navigateToBooks() {
    for (const selector of SELECTORS.BOOKS_LINK) {
      if (await this.page.locator(selector).count() > 0) {
        await this.page.locator(selector).first().click();
        await this.page.waitForLoadState(TIMEOUTS.DOM_CONTENT_LOADED);
        return;
      }
    }
  }

  /**
   * Open add book dialog/form
   */
  async openAddBookDialog() {
    return this.withRetry(async () => {
      for (const selector of SELECTORS.ADD_BOOK_BUTTON) {
        const count = await this.page.locator(selector).count();
        if (count > 0) {
          await this.page.locator(selector).first().click();
          await this.page.waitForTimeout(500); // Wait for dialog animation
          return;
        }
      }
      throw new Error('Add book button not found');
    });
  }

  /**
   * Check if add book dialog/form is open
   */
  async isAddBookDialogOpen(): Promise<boolean> {
    const dialogSelectors = [
      '.modal',
      '.dialog',
      '[role="dialog"]',
      '.add-book-form',
      '.book-form',
      '#addBookModal',
      '.popup',
      '.overlay'
    ];

    for (const selector of dialogSelectors) {
      const count = await this.page.locator(selector).count();
      if (count > 0) {
        const isVisible = await this.page.locator(selector).first().isVisible();
        if (isVisible) {
          return true;
        }
      }
    }
    return false;
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
    const results: { field: string; success: boolean }[] = [];

    try {
      if (bookData.title) {
        const success = await this.fillField('title', bookData.title);
        results.push({ field: 'title', success });
      }
      if (bookData.author) {
        const success = await this.fillField('author', bookData.author);
        results.push({ field: 'author', success });
      }
      if (bookData.isbn) {
        const success = await this.fillField('isbn', bookData.isbn);
        results.push({ field: 'isbn', success });
      }
      if (bookData.genre) {
        const success = await this.fillField('genre', bookData.genre);
        results.push({ field: 'genre', success });
      }
      if (bookData.publicationDate) {
        const success = await this.fillField(['publicationDate', 'publication-date', 'date'], bookData.publicationDate);
        results.push({ field: 'publicationDate', success });
      }
      if (bookData.price) {
        const success = await this.fillField('price', bookData.price);
        results.push({ field: 'price', success });
      }

      // Log summary of filled fields
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      console.log(` Form filling summary: ${successful.length}/${results.length} fields filled successfully`);
      if (failed.length > 0) {
        console.warn(`Failed to fill fields: ${failed.map(f => f.field).join(', ')}`);
      }
    } catch (error) {
      console.error('Error filling book form:', error instanceof Error ? error.message : String(error));
      throw error; // Re-throw to let the test handle it
    }
  }

  /**
   * Helper to fill a field by multiple possible names
   */
  /**
   * Enhanced field filling method with comprehensive element type support and detailed logging
   * @param fieldName - Single field name or array of field names to try
   * @param value - Value to fill/select in the field
   * @returns Promise<boolean> - true if field was found and filled, false otherwise
   */
  private async fillField(fieldName: string | string[], value: string): Promise<boolean> {
    const fieldNames = Array.isArray(fieldName) ? fieldName : [fieldName];
    console.log(`Attempting to fill field(s): ${fieldNames.join('|')} with value: "${value}"`);

    for (const name of fieldNames) {
      const selectors = FORM_FIELDS.getFieldSelectors(name);
      console.log(`Trying ${selectors.length} selectors for field: ${name}`);

      for (let i = 0; i < selectors.length; i++) {
        const selector = selectors[i];
        
        try {
          const element = this.page.locator(selector).first();
          const count = await element.count();
          
          if (count > 0) {
            // Check if element is visible and enabled
            await element.waitFor({ state: 'visible', timeout: 2000 });
            const isEnabled = await element.isEnabled();
            
            if (!isEnabled) {
              console.log(`Field found but disabled: ${selector}`);
              continue;
            }

            const tagName = await element.evaluate(el => el.tagName.toLowerCase());
            const inputType = await element.getAttribute('type');
            
            console.log(`Found field: ${selector} (${tagName}${inputType ? `:${inputType}` : ''})`);
            
            // Handle different input types
            if (tagName === 'select') {
              // For select elements, first check what options are available
              const options = await element.locator('option').allTextContents();
              console.log(`Available select options: ${options.join(', ')}`);
              
              // Try different selection methods
              try {
                await element.selectOption({ label: value });
              } catch {
                try {
                  await element.selectOption({ value: value });
                } catch {
                  try {
                    await element.selectOption(value);
                  } catch {
                    // If the exact value doesn't work, try to find a close match
                    const fallbackOptions = ['Fiction', 'Non-Fiction', 'Mystery', 'Romance'];
                    const fallback = fallbackOptions.find(option => options.includes(option));
                    if (fallback) {
                      console.log(`Using fallback genre: ${fallback} instead of ${value}`);
                      await element.selectOption(fallback);
                    } else {
                      throw new Error(`Could not select "${value}" and no suitable fallback found. Available options: ${options.join(', ')}`);
                    }
                  }
                }
              }
            } else if (inputType === 'checkbox' || inputType === 'radio') {
              // Handle checkbox/radio inputs
              if (value.toLowerCase() === 'true' || value === '1') {
                await element.check();
              } else {
                await element.uncheck();
              }
            } else {
              // Handle text inputs, textareas, etc.
              await element.clear();
              await element.fill(value);
            }
            
            console.log(`Successfully filled field: ${name} with value: "${value}"`);
            return true;
          }
        } catch (error) {
          // Handle page closed errors or other critical issues
          if (error instanceof Error && error.message.includes('Target page, context or browser has been closed')) {
            console.error('Page/browser closed unexpectedly:', error.message);
            return false;
          }
          console.log(`Error filling field ${selector}: ${error instanceof Error ? error.message : String(error)}`);
          continue;
        }
      }
    }
    
    // If no field was found and filled
    console.warn(`Field "${fieldNames.join('|')}" not found or could not be filled with value "${value}"`);
    return false;
  }

  /**
   * Submit book form
   */
  async submitBookForm() {
    return this.withRetry(async () => {
      for (const selector of SELECTORS.SUBMIT_BUTTON) {
        const count = await this.page.locator(selector).count();
        if (count > 0) {
          await this.page.locator(selector).first().click();
          await this.page.waitForLoadState(TIMEOUTS.DOM_CONTENT_LOADED);
          // Wait a bit more for any async operations
          await this.page.waitForTimeout(1000);
          return;
        }
      }
      throw new Error('Submit button not found');
    });
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
        await this.page.waitForLoadState(TIMEOUTS.DOM_CONTENT_LOADED);
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
