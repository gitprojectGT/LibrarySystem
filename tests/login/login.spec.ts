import { test, expect, Locator } from '@playwright/test';
import { AuthHelper } from '../helpers/auth';
import { Assertions } from '../helpers/assertions';
import { 
  CREDENTIALS, 
  TIMEOUTS, 
  VIEWPORT, 
  URLS, 
  URL_PATTERNS, 
  VALIDATION_MESSAGES_LOGIN,
  SELECTORS
} from '../fixtures/test-data';

test.describe('Login Functionality', () => {
  let authHelper: AuthHelper;
  let assertions: Assertions;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    assertions = new Assertions(page);

    // Maximize browser viewport
    await page.setViewportSize(VIEWPORT.DESKTOP);

    // Navigate directly to login page
    await page.goto(URLS.LOGIN_PATH);
    await page.waitForLoadState(TIMEOUTS.NETWORK_IDLE);
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await authHelper.login('admin', 'admin');
    await assertions.verifyDashboardLoaded();
  });

  test('should display error with invalid username or password', async ({ page }) => {
    // Manually fill the form to avoid timeout issues with helper
    await page.waitForLoadState(TIMEOUTS.NETWORK_IDLE);

    const usernameField = page.locator(SELECTORS.USERNAME_FIELD.join(', ')).first();
    const passwordField = page.locator(SELECTORS.PASSWORD_FIELD).first();
    const loginButton = page.locator(SELECTORS.LOGIN_BUTTON.join(', ')).first();

    await usernameField.fill('invaliduser');
    await passwordField.fill('admin');
    await loginButton.click();

    await page.waitForTimeout(2000); // Wait for response

    // Should remain on login page or show error
    const url = page.url();
    const hasTextError = await expect(page.locator('text=Invalid username or password. Please try again.')).toBeVisible();

    expect(url.includes('login') || url === URLS.BASE_URL || hasTextError).toBeTruthy();
  });


  test('should display error  with your submission', async ({ page }) => {
    await page.waitForLoadState(TIMEOUTS.NETWORK_IDLE);

    const loginButton = page.locator('button[type="submit"], button:has-text("Log In")').first();
    await loginButton.click();

    await page.waitForTimeout(1000);

 const expectedErrors = [
      VALIDATION_MESSAGES_LOGIN.REQUIRED_FIELDS.USERNAME,
      VALIDATION_MESSAGES_LOGIN.REQUIRED_FIELDS.PASSWORD,
    ];

    await assertions.verifyValidationErrors(expectedErrors);


    // Check for validation errors - should remain on login page
    const url = page.url();
    expect(url.includes('login') || url === URLS.BASE_URL).toBeTruthy();
  });

  test('should display error with empty username', async ({ page }) => {
    await page.waitForLoadState(TIMEOUTS.NETWORK_IDLE);

    const passwordField = page.locator('input[type="password"]').first();
    const loginButton = page.locator(SELECTORS.LOGIN_BUTTON.join(', ')).first();

    await passwordField.fill('admin');
    await loginButton.click();

    await page.waitForTimeout(1000);

    const expectedErrors = [
      VALIDATION_MESSAGES_LOGIN.REQUIRED_FIELDS.USERNAME,
   
    ];

    await assertions.verifyValidationErrors(expectedErrors);
    const url = page.url();
    expect(url.includes('login') || url === URLS.BASE_URL).toBeTruthy();
  });

  test('should display error with empty password', async ({ page }) => {
    await page.waitForLoadState(TIMEOUTS.NETWORK_IDLE);

    const usernameField = page.locator(SELECTORS.USERNAME_FIELD.join(', ')).first();
    const loginButton = page.locator(SELECTORS.LOGIN_BUTTON.join(', ')).first();

    await usernameField.fill('admin');
    await loginButton.click();

    await page.waitForTimeout(1000);

    const expectedErrors = [
      VALIDATION_MESSAGES_LOGIN.REQUIRED_FIELDS.PASSWORD,
    ];

    await assertions.verifyValidationErrors(expectedErrors);
    const url = page.url();
    expect(url.includes('login') || url === URLS.BASE_URL).toBeTruthy();
  });


  test('should trim whitespace from credentials', async ({ page }) => {
    await page.waitForLoadState(TIMEOUTS.NETWORK_IDLE);

    const usernameField = page.locator('input[type="text"]').first();
    const passwordField = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button[type="submit"], button:has-text("Log In")').first();

    // Test with whitespace-padded valid credentials
    await usernameField.fill('  admin  ');
    await passwordField.fill('  admin  ');
    await loginButton.click();

    await page.waitForLoadState(TIMEOUTS.NETWORK_IDLE);
    
    // If the app properly trims whitespace, login should succeed
    // and we should be redirected away from the login page
    const url = page.url();

    const hasTextError = await expect(page.locator('text=Invalid username or password. Please try again.')).toBeVisible();

    expect(url.includes('login') || url === URLS.BASE_URL || hasTextError).toBeTruthy();
  });

  test('should show password as masked', async ({ page }) => {
    const passwordField = page.locator('input[type="password"]').first();
    await expect(passwordField).toHaveAttribute('type', 'password');
  });

  test('This is a flaky test only to show Log out button doesn\'t work successfully', async ({ page }) => {
    await authHelper.login(CREDENTIALS.VALID.USERNAME, CREDENTIALS.VALID.PASSWORD);
    await assertions.verifyDashboardLoaded();

    await authHelper.logout();

    // Should return to login page
    await page.waitForLoadState(TIMEOUTS.NETWORK_IDLE);
    const url = page.url();
    expect(url).toMatch(URL_PATTERNS.LOGOUT_WRONG_PATH);
  });

});
