# Test Helpers Fixture

## Overview

This fixture provides a centralized way to access test helper instances (`AuthHelper`, `BookActions`, and `Assertions`) across all your Playwright tests. Instead of manually creating these helpers in each test, you can now use them as fixture parameters.

## Usage

### 1. Import the fixture

Replace the standard Playwright imports in your test files:

```typescript
// OLD WAY
import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth';
import { BookActions } from '../helpers/book-actions';
import { Assertions } from '../helpers/assertions';

// NEW WAY
import { test, expect } from '../fixtures/test-helpers';
```

### 2. Use helpers as fixture parameters

Instead of manually creating helper instances:

```typescript
// OLD WAY
test('my test', async ({ page }) => {
  const authHelper = new AuthHelper(page);
  const bookActions = new BookActions(page);
  const assertions = new Assertions(page);
  
  // ... test code
});

// NEW WAY
test('my test', async ({ page, authHelper, bookActions, assertions }) => {
  // Helpers are ready to use!
  // ... test code
});
```

### 3. Updated beforeEach hooks

You can now access helpers in beforeEach hooks as well:

```typescript
// OLD WAY
test.describe('My Tests', () => {
  let authHelper: AuthHelper;
  
  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.login('admin', 'admin');
  });
});

// NEW WAY
test.describe('My Tests', () => {
  test.beforeEach(async ({ page, authHelper }) => {
    await authHelper.login('admin', 'admin');
  });
});
```

## Available Fixtures

- **`authHelper`**: Instance of `AuthHelper` for authentication-related actions
- **`bookActions`**: Instance of `BookActions` for book management operations  
- **`assertions`**: Instance of `Assertions` for custom verification methods
- **`page`**: Standard Playwright page fixture (unchanged)
- **`expect`**: Standard Playwright expect function (re-exported for convenience)

## Benefits

1. **Consistency**: All tests use the same helper instantiation pattern
2. **Maintenance**: Changes to helper initialization only need to be made in one place
3. **Cleaner Code**: Less boilerplate in each test file
4. **Type Safety**: Full TypeScript support with proper intellisense
5. **Flexibility**: Only import the helpers you need in each test

## Example

```typescript
import { test, expect } from '../fixtures/test-helpers';
import { CREDENTIALS, BOOK_DATA } from '../fixtures/test-data';

test.describe('Book Management', () => {
  test.beforeEach(async ({ authHelper }) => {
    await authHelper.login(CREDENTIALS.VALID.USERNAME, CREDENTIALS.VALID.PASSWORD);
  });

  test('should create a new book', async ({ page, bookActions, assertions }) => {
    await page.goto('/add-book');
    await bookActions.fillBookForm(BOOK_DATA.VALID_BOOK);
    await bookActions.submitBookForm();
    await assertions.verifyBookInList(BOOK_DATA.VALID_BOOK.title);
  });
});
```

## Migration

The fixture has been applied to the following test files:

- `tests/e2e/user-journey.spec.ts`
- `tests/login/login.spec.ts`  
- `tests/books/book-create.spec.ts`

Other test files can be migrated using the same pattern shown above.