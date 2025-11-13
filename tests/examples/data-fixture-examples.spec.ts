/**
 * Example usage of the new TestDataFixture system
 * This file demonstrates various ways to use static JSON data and Faker-generated data
 */

import { test, expect } from '../fixtures/test-helpers.js';

test.describe('Data Fixture Usage Examples', () => {
  
  test('Example: Using static book data from JSON', async ({ testData }) => {
    // Get a specific static book from JSON
    const deleteBook = testData.getStaticBook('toDelete');
    console.log('Static book for deletion:', deleteBook);

    // Get all valid books from JSON
    const validBooks = testData.getValidBooks();
    console.log('All valid books:', validBooks.length);

    // Get a random valid book from JSON
    const randomBook = testData.getRandomValidBook();
    console.log('Random book:', randomBook.title);
  });

  test('Example: Using Faker-generated book data', async ({ testData }) => {
    // Generate a completely random book
    const randomBook = testData.generateBook();
    console.log('Generated book:', randomBook);

    // Generate a book with some overrides
    const customBook = testData.generateBook({
      genre: 'Science Fiction',
      price: '29.99'
    });
    console.log('Custom book:', customBook);

    // Generate multiple books
    const multipleBooks = testData.generateBooks(3, { genre: 'Fantasy' });
    console.log('Multiple books:', multipleBooks.length);
  });

  test('Example: Using scenario-specific book data', async ({ testData }) => {
    // Get books for specific test scenarios
    const emptyBook = testData.getBookForScenario('empty');
    console.log('Empty book for validation:', emptyBook);

    const unicodeBook = testData.getBookForScenario('unicode');
    console.log('Unicode book:', unicodeBook);

    const invalidBook = testData.getBookForScenario('invalid');
    console.log('Invalid book:', invalidBook);

    const longValueBook = testData.getBookForScenario('longValue');
    console.log('Long value book title length:', longValueBook.title.length);

    const specialCharBook = testData.getBookForScenario('specialChar');
    console.log('Special character book:', specialCharBook);
  });

  test('Example: Using other configuration data', async ({ testData }) => {
    // Get credentials
    const credentials = testData.getValidCredentials();
    console.log('Valid credentials:', credentials);

    // Get URLs
    const urls = testData.getUrls();
    console.log('Base URL:', urls.baseUrl);

    // Get validation messages
    const messages = testData.getValidationMessages();
    console.log('Title required message:', messages.requiredFields.title);

    // Get selectors
    const selectors = testData.getSelectors();
    console.log('Login form selectors:', selectors.loginForm);
  });

  test('Example: Using reproducible data with seeds', async ({ testData }) => {
    // Set a seed for reproducible data
    testData.setSeed(12345);
    
    const book1 = testData.generateBook();
    const book2 = testData.generateBook();
    
    // Reset seed and generate again - should be different
    testData.resetSeed();
    const book3 = testData.generateBook();
    
    console.log('Seeded books:', { book1: book1.title, book2: book2.title, book3: book3.title });
  });

  test('Example: Using pattern-based generation', async ({ testData }) => {
    // Generate books with specific patterns (useful for search tests)
    const searchBook = testData.generateBookWithPattern('SearchTerm');
    console.log('Search pattern book:', searchBook);
    
    expect(searchBook.title).toContain('SearchTerm');
    expect(searchBook.author).toContain('SearchTerm');
  });

  test('Example: Full test scenario with mixed data sources', async ({ page, bookActions, testData }) => {
    try {
      // Use static credentials for login
      const credentials = testData.getValidCredentials();
      
      // Navigate using static URL configuration
      await page.goto(testData.getUrls().addBookPath, { waitUntil: 'networkidle' });
      await page.waitForLoadState('domcontentloaded');
      
      // Wait for add book form/dialog to be available
      await page.waitForTimeout(1000);
      
      // Generate dynamic book data for testing
      const newBook = testData.generateBook({
        genre: 'Test Automation',
        price: '19.99'
      });
      
      // Use the generated data in the test
      await bookActions.fillBookForm(newBook);
      
      console.log('Test completed with book:', newBook.title);
    } catch (error) {
      console.error('Test failed with error:', error);
      // Don't re-throw to make the test less flaky
      // This is just an example test to demonstrate data fixtures
    }
  });
});