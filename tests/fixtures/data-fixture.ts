/**
 * Data fixture that combines static JSON data with dynamic Faker generation
 * Provides a unified interface for accessing test data throughout the test suite
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { BookDataGenerator, type BookData, type PartialBookData } from './book-generator.js';

// ES module compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Type definitions for JSON data structure
interface StaticBookData {
  validBooks: BookData[];
  testBooks: {
    toDelete: BookData;
    journey1: BookData;
    journey2: BookData;
    emptyValidation: Partial<BookData>;
    unicode: BookData;
  };
}

interface CredentialData {
  valid: {
    username: string;
    password: string;
  };
  caseSensitiveTest: {
    username: string;
    password: string;
  };
}

interface ConfigData {
  urls: {
    loginPath: string;
    booksPath: string;
    addBookPath: string;
    baseUrl: string;
  };
  timeouts: {
    networkIdle: 'networkidle';
    domContentLoaded: 'domcontentloaded';
    load: 'load';
  };
  viewport: {
    desktop: { width: number; height: number };
    tablet: { width: number; height: number };
    mobile: { width: number; height: number };
  };
  validationMessages: {
    requiredFields: Record<string, string>;
    login: Record<string, string>;
  };
  selectors: {
    loginForm: Record<string, string>;
    bookForm: Record<string, string>;
  };
}

export class TestDataFixture {
  private static instance: TestDataFixture;
  private booksData!: StaticBookData;
  private credentialsData!: CredentialData;
  private configData!: ConfigData;
  private dataPath: string;

  private constructor() {
    this.dataPath = path.join(__dirname, 'data');
    this.loadData();
  }

  /**
   * Get singleton instance of TestDataFixture
   */
  static getInstance(): TestDataFixture {
    if (!TestDataFixture.instance) {
      TestDataFixture.instance = new TestDataFixture();
    }
    return TestDataFixture.instance;
  }

  /**
   * Load all JSON data files
   */
  private loadData(): void {
    try {
      this.booksData = JSON.parse(
        fs.readFileSync(path.join(this.dataPath, 'books.json'), 'utf8')
      );
      this.credentialsData = JSON.parse(
        fs.readFileSync(path.join(this.dataPath, 'credentials.json'), 'utf8')
      );
      this.configData = JSON.parse(
        fs.readFileSync(path.join(this.dataPath, 'config.json'), 'utf8')
      );
    } catch (error) {
      throw new Error(`Failed to load test data: ${error}`);
    }
  }

  /**
   * Reload data from JSON files (useful if data changes during test run)
   */
  public reloadData(): void {
    this.loadData();
  }

  // ========== BOOK DATA METHODS ==========

  /**
   * Get a static book from JSON data
   */
  getStaticBook(bookKey: keyof StaticBookData['testBooks']): BookData {
    return this.booksData.testBooks[bookKey] as BookData;
  }

  /**
   * Get all valid books from JSON
   */
  getValidBooks(): BookData[] {
    return this.booksData.validBooks;
  }

  /**
   * Get a random valid book from JSON data
   */
  getRandomValidBook(): BookData {
    const books = this.getValidBooks();
    const randomIndex = Math.floor(Math.random() * books.length);
    return books[randomIndex];
  }

  /**
   * Generate a new book using Faker
   */
  generateBook(overrides?: PartialBookData): BookData {
    return BookDataGenerator.generateBook(overrides);
  }

  /**
   * Generate multiple books using Faker
   */
  generateBooks(count: number, overrides?: PartialBookData): BookData[] {
    return BookDataGenerator.generateBooks(count, overrides);
  }

  /**
   * Get book for specific test scenarios
   */
  getBookForScenario(scenario: 'empty' | 'unicode' | 'invalid' | 'longValue' | 'specialChar'): BookData {
    switch (scenario) {
      case 'empty':
        return BookDataGenerator.generateEmptyBook();
      case 'unicode':
        return BookDataGenerator.generateUnicodeBook();
      case 'invalid':
        return BookDataGenerator.generateInvalidBook();
      case 'longValue':
        return BookDataGenerator.generateLongValueBook();
      case 'specialChar':
        return BookDataGenerator.generateSpecialCharacterBook();
      default:
        throw new Error(`Unknown scenario: ${scenario}`);
    }
  }

  /**
   * Generate book with search pattern
   */
  generateBookWithPattern(pattern: string): BookData {
    return BookDataGenerator.generateBookWithPattern(pattern);
  }

  // ========== CREDENTIAL METHODS ==========

  /**
   * Get valid credentials
   */
  getValidCredentials() {
    return this.credentialsData.valid;
  }

  /**
   * Get case sensitive test credentials
   */
  getCaseSensitiveCredentials() {
    return this.credentialsData.caseSensitiveTest;
  }

  // ========== CONFIG METHODS ==========

  /**
   * Get URLs configuration
   */
  getUrls() {
    return this.configData.urls;
  }

  /**
   * Get timeouts configuration
   */
  getTimeouts() {
    return this.configData.timeouts;
  }

  /**
   * Get viewport configuration
   */
  getViewport() {
    return this.configData.viewport;
  }

  /**
   * Get validation messages
   */
  getValidationMessages() {
    return this.configData.validationMessages;
  }

  /**
   * Get selectors configuration
   */
  getSelectors() {
    return this.configData.selectors;
  }

  // ========== UTILITY METHODS ==========

  /**
   * Set seed for reproducible Faker data
   */
  setSeed(seed: number): void {
    BookDataGenerator.seed(seed);
  }

  /**
   * Reset Faker seed to random
   */
  resetSeed(): void {
    BookDataGenerator.resetSeed();
  }

  /**
   * Get all data as object (for migration compatibility)
   */
  getAllData() {
    return {
      books: this.booksData,
      credentials: this.credentialsData,
      config: this.configData
    };
  }
}

// Export a default instance for convenience
export const testData = TestDataFixture.getInstance();