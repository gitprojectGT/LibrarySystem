/**
 * Test data fixtures for Library System E2E tests
 * Centralized location for all test constants, credentials, and reusable data
 */

// Application URLs and routes
export const URLS = {
  LOGIN_PATH: '/login',
  BOOKS_PATH: '/books',
  ADD_BOOK_PATH: '/add-book',
  BASE_URL: 'https://frontendui-librarysystem.onrender.com',
} as const;

// User credentials
export const CREDENTIALS = {
  VALID: {
    USERNAME: 'admin',
    PASSWORD: 'admin',
  },
  CASE_SENSITIVE_TEST: {
    USERNAME: 'ADMIN',
    PASSWORD: 'ADMIN',
  },
} as const;

// Sample book data for testing
export const BOOK_DATA = {
  VALID_BOOK: {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '9780743273565',
    genre: 'Fiction',
    publicationDate: '1925-04-10',
    price: '15.99',
  },


  TO_DELETE_BOOK: {
    title: 'The Book to Delete',
    author: 'F. Book to Delete',
    isbn: '9780743273565',
    genre: 'Fiction',
    publicationDate: '1925-04-10',
    price: '15.99',
  },


  JOURNEY_BOOK_1: {
    title: 'Pragmatic Programmer',
    author: 'Andrew Hunt',
    isbn: '9780135957059',
    genre: 'Fiction',
    publicationDate: '2019-10-13',
    price: '49.99',
  },
  JOURNEY_BOOK_2: {
    title: 'Clean Code E2E',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    genre: 'Fiction',
    publicationDate: '2008-08-01',
    price: '45.99',
  },
  EMPTY_VALIDATION_BOOK: {
    title: '',
    author: '',
    isbn: '9780123456789',
  },
  UNICODE_BOOK: {
    title: 'Unicode Test: 测试员', // less than 20 characters otherwise fails validation
    author: 'José Super Tester',
    isbn: '9780123456789',
    genre: 'Fiction',
    publicationDate: '1925-04-10',
    price: '99.99',
  },
  CONFIRM_DELETE_BOOK: {
    title: 'Confirm Delete Test',
    author: 'Test Author',
    isbn: '9780123456789',
    genre: 'Fiction',
    publicationDate: '2023-01-01',
    price: '20.00',
  },
} as const;

// Validation error messages
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELDS: {
    TITLE: 'Title is required.',
    AUTHOR: 'Author is required.',
    GENRE: 'Genre is required.',
    ISBN: 'ISBN is required.',
    PUBLICATION_DATE: 'Publication Date is required.',
    PRICE: 'Price is required.',
  },
} as const;


//Validation error messages on login form
export const VALIDATION_MESSAGES_LOGIN = {
  REQUIRED_FIELDS: {
    USERNAME: 'Please enter your username',
    PASSWORD: 'Please enter your password',
  },
} as const;


// CSS Selectors - organized by element type and functionality
export const SELECTORS = {
  // Authentication selectors
  USERNAME_FIELD: [
    'input[type="text"]',
    'input[name*="user"]',
    'input[placeholder*="username" i]',
    'input[name="username"]',
    'input[name="user"]',
    'input[id="username"]',
  ],
  PASSWORD_FIELD: 'input[type="password"]',

  LOGIN_BUTTON: [
    'button[type="submit"]',
    'button:has-text("Login")',
    'button:has-text("Log In")',
    'button:has-text("Sign in")',
    'input[type="submit"]',
  ],


  // Navigation selectors
  BOOKS_LINK: [
    'a:has-text("Books")',
    'button:has-text("Books")',
    '[href*="books"]',
  ],

  // Book form selectors
  ADD_BOOK_BUTTON: [
    'button:has-text("Add Book")',
    '[class*="add-book"]',
  ],

  // Form submission selectors
  SUBMIT_BUTTON: [
    'button[type="submit"]',
    'button:has-text("Submit")',
    'button:has-text("Add")', // TO DO: verify these selectors
  ],

  // Dialog/Modal selectors
  CONFIRM_DELETE_BUTTON: [

    'button:has-text("Delete")',
  ],

  // Search selectors
  SEARCH_INPUT: [
    'input[type="search"]',
    'input[placeholder*="search" i]',
    'input[name="search"]',
    'input[id="search"]',
  ],


  VALIDATION_ERROR: [
    '.field-error',
    '.invalid-feedback',
    '[class*="error"]',
    '.error-message',
    '[role="alert"]', // TO DO :verify these selectors
  ],

  // Book management selectors
  EDIT_BUTTON: [
    'button:has-text("Edit")',
    '[class*="edit"]',
    '[aria-label*="edit" i]',
  ],
  DELETE_BUTTON: [
    'button:has-text("Delete")',
    '[class*="delete"]',
    '[aria-label*="delete" i]',
  ],

  // Table and list selectors
  TABLE_ROWS: [
    'table tbody tr',
    '[class*="book-item"]',
  ],
  BOOK_ROW: (title: string) => [
    `tr:has-text("${title}")`,
    `[class*="book"]:has-text("${title}")`,
  ],
} as const;

// Test timeouts and wait times
export const TIMEOUTS = {
  // TO DO: adjust as needed and verify if networkidle is the best choice. NO! It is not the best choice. 
  // Maybe it's better to use documentloaded so it will wait for DOMContentLoaded ???
  NETWORK_IDLE: 'networkidle' as const,
} as const;

// Viewport configuration
export const VIEWPORT = {
  DESKTOP: {
    width: 1920,
    height: 1080,
  },
} as const;

// Form field selector generators
export const FORM_FIELDS = {
  // TODO :Potential selectors for a field by name. Are they sufficient or  do we need more or do we define them differently ?
  getFieldSelectors: (fieldName: string) => [
    `input[name="${fieldName}"]`,
    `input[id="${fieldName}"]`,
    `textarea[name="${fieldName}"]`,
    `textarea[id="${fieldName}"]`,
    `select[name="${fieldName}"]`,
    `select[id="${fieldName}"]`,
    `input[placeholder*="${fieldName}" i]`,
  ],


} as const;

// URL patterns for validation
export const URL_PATTERNS = {
  // TODO: They are redundant . Verify these patterns and refine logout wrong path and reuse URLS.BASE_URL where applicable
  LOGOUT_WRONG_PATH: "https://frontendui-librarysystem.onrender.com/books",
  LOGIN_PAGE: /login/i,
  BOOKS_PAGE: /books/i,
} as const;