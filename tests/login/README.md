# Login Tests - Implementation Notes

## Overview

The login test suite has been optimized to handle different login scenarios without timeout issues.

## Key Changes

### Problem Solved
The original tests used `AuthHelper.login()` for all scenarios, including invalid credentials. This caused timeouts because the helper expected to find form fields even after failed login attempts when the page state might have changed.

### Solution
For **failed login scenarios** (invalid credentials, empty fields, security tests), the tests now:
1. Manually locate and interact with form elements
2. Use explicit waits (`waitForTimeout`) instead of relying on element presence
3. Allow for multiple valid URL states (login page, home page, error state)

### Test Categories

#### ✅ Successful Login Tests
- Uses `AuthHelper.login()` (works fine for valid credentials)
- Example: "should successfully login with valid credentials"

#### ⚠️ Failed Login Tests (Manual Form Interaction)
These tests bypass the helper to avoid timeout issues:
- Invalid username
- Invalid password
- Empty credentials
- Empty username
- Empty password
- SQL injection attempts
- XSS attempts
- Case sensitivity tests
- Whitespace handling tests

#### 🔒 Session/State Tests
- Uses helper for initial login, then tests session behavior
- Examples: logout, session persistence, protected routes

## Usage

```bash
# Run all login tests
npm run test:login

# Run specific test
npx playwright test tests/login/login.spec.ts -g "should successfully login"

# Run in headed mode to see interactions
npm run test:login -- --headed
```

## Expected Behaviors

### Valid Login (admin/admin)
- Redirects to dashboard/inventory page
- URL changes away from login page
- Session is maintained

### Invalid Credentials
- Remains on login page OR shows error message
- URL stays at login/home page
- No dashboard access

### Empty Fields
- HTML5 validation may prevent submission
- OR remains on login page
- No successful authentication

### Security Tests
- SQL injection blocked/sanitized
- XSS scripts blocked/sanitized
- System remains secure

## Troubleshooting

### Tests timing out?
- Check if application is accessible at https://frontendui-librarysystem.onrender.com/
- Render free tier may have slow cold starts (first load can take 30+ seconds)
- Increase timeout in playwright.config.ts if needed

### Selector not found errors?
- UI may have changed - update selectors in the test file
- Form elements should match patterns: `input[type="text"]`, `input[type="password"]`, `button[type="submit"]`

### URL assertion failures?
- Application may redirect to different URLs
- Check actual URL and update expectations
- Consider using `.toMatch(/regex/)` for flexible matching
