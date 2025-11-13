/**
 * Book data generator using Faker.js
 * Provides realistic, dynamic test data for book entities
 */

import { faker } from '@faker-js/faker';

export interface BookData {
  title: string;
  author: string;
  isbn: string;
  genre: string;
  publicationDate: string;
  price: string;
}

export interface PartialBookData {
  title?: string;
  author?: string;
  isbn?: string;
  genre?: string;
  publicationDate?: string;
  price?: string;
}

export class BookDataGenerator {
  private static readonly GENRES = [
    'Fiction',
    'Non-Fiction', 
    'Mystery',
    'Romance',
    'Thriller',
    'Fantasy',
    'Biography',
    'History'
  ];

  /**
   * Generate a complete book with realistic data
   */
  static generateBook(overrides?: PartialBookData): BookData {
    return {
      title: overrides?.title ?? faker.lorem.words({ min: 1, max: 4 }),
      author: overrides?.author ?? faker.person.fullName(),
      isbn: overrides?.isbn ?? faker.commerce.isbn({ variant: 13, separator: '' }),
      genre: overrides?.genre ?? faker.helpers.arrayElement(this.GENRES),
      publicationDate: overrides?.publicationDate ?? faker.date.past({ years: 50 }).toISOString().split('T')[0],
      price: overrides?.price ?? faker.commerce.price({ min: 5, max: 100, dec: 2 }),
      ...overrides
    };
  }

  /**
   * Generate multiple books at once
   */
  static generateBooks(count: number, overrides?: PartialBookData): BookData[] {
    return Array.from({ length: count }, () => this.generateBook(overrides));
  }

  /**
   * Generate a book with empty required fields for validation testing
   */
  static generateEmptyBook(): BookData {
    return {
      title: '',
      author: '',
      isbn: faker.commerce.isbn({ variant: 13, separator: '' }),
      genre: '',
      publicationDate: '',
      price: ''
    };
  }

  /**
   * Generate a book with unicode characters for internationalization testing
   */
  static generateUnicodeBook(): BookData {
    const unicodeTitles = [
      'Unicode Test: 测试员',
      'Тестовая книга',
      'كتاب الاختبار',
      'テストブック',
      'Libro de Prueba',
      'Livre de Test'
    ];
    
    const unicodeAuthors = [
      'José María García',
      'Михаил Булгаков',
      'محمد أحمد',
      '田中太郎',
      'François Müller',
      'Olav Bjørn'
    ];

    return this.generateBook({
      title: faker.helpers.arrayElement(unicodeTitles),
      author: faker.helpers.arrayElement(unicodeAuthors)
    });
  }

  /**
   * Generate a book with extremely long values for boundary testing
   */
  static generateLongValueBook(): BookData {
    return this.generateBook({
      title: faker.lorem.words(50),
      author: faker.lorem.words(20),
      genre: faker.lorem.words(10)
    });
  }

  /**
   * Generate a book with special characters for injection testing
   */
  static generateSpecialCharacterBook(): BookData {
    const specialCharTitles = [
      'Book with "Quotes" & Symbols',
      "Title with 'Single Quotes'",
      'Title with <HTML> Tags',
      'Title with SQL\'; DROP TABLE books;--',
      'Title with {JSON} brackets'
    ];

    return this.generateBook({
      title: faker.helpers.arrayElement(specialCharTitles),
      author: `Author with ${faker.helpers.arrayElement(['&', '<', '>', '"', "'", '\\', '/'])}`
    });
  }

  /**
   * Generate a book with invalid data for negative testing
   */
  static generateInvalidBook(): BookData {
    return {
      title: faker.lorem.words({ min: 1, max: 4 }),
      author: faker.person.fullName(),
      isbn: 'invalid-isbn',
      genre: faker.helpers.arrayElement(this.GENRES),
      publicationDate: '2025-13-45', // Invalid date
      price: 'not-a-number'
    };
  }

  /**
   * Generate a book matching a specific pattern (useful for search tests)
   */
  static generateBookWithPattern(pattern: string): BookData {
    return this.generateBook({
      title: `${pattern} ${faker.lorem.words({ min: 1, max: 3 })}`,
      author: `${faker.person.firstName()} ${pattern}`
    });
  }

  /**
   * Seed the faker for reproducible tests
   */
  static seed(seedValue: number): void {
    faker.seed(seedValue);
  }

  /**
   * Reset faker to use random seed
   */
  static resetSeed(): void {
    faker.seed();
  }
}