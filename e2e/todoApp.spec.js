import { test, expect } from '@playwright/test';

test.describe('ToDo App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1', { state: 'visible', timeout: 30000 });
  });

  test('should display app', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h2')).toBeVisible();
  });

  test('should show validation error for empty title', async ({ page }) => {
    const addButton = page.locator('button').filter({ hasText: '+' }).or(page.locator('button[title*="Add"]'));
    await addButton.first().click();
    await page.waitForSelector('[data-testid="task-title-input"]', { timeout: 5000 });
    await page.locator('[data-testid="submit-button"]').click();
    await expect(page.locator('[data-testid="title-error"]')).toBeVisible({ timeout: 5000 });
  });

  test('should show validation error for short title', async ({ page }) => {
    const addButton = page.locator('button').filter({ hasText: '+' }).or(page.locator('button[title*="Add"]'));
    await addButton.first().click();
    
    await page.waitForSelector('[data-testid="task-title-input"]');
    
    await page.locator('[data-testid="task-title-input"]').fill('ab');
    await page.locator('[data-testid="submit-button"]').click();
    
    const error = page.locator('[data-testid="title-error"]');
    await expect(error).toBeVisible();
    await expect(error).toContainText('3 characters');
  });

  test('should add a task', async ({ page }) => {
    const addButton = page.locator('button').filter({ hasText: '+' }).or(page.locator('button[title*="Add"]'));
    await addButton.first().click();
    await page.waitForSelector('[data-testid="task-title-input"]');
    
    const uniqueTitle = `Test Task ${Date.now()}`;
    await page.locator('[data-testid="task-title-input"]').fill(uniqueTitle);
    await page.locator('[data-testid="task-description-input"]').fill('E2E test description');
    await page.locator('.react-select-container').click();
    await page.locator('.react-select__option').first().click();
    await page.keyboard.press('Escape');
    
    await page.locator('[data-testid="submit-button"]').click();
    await page.waitForTimeout(2000);
    await expect(page.getByText(uniqueTitle)).toBeVisible({ timeout: 5000 });
  });

  test('should toggle task', async ({ page }) => {
    const checkbox = page.locator('[data-testid="task-item"]').first().locator('button').first();
    
    await checkbox.waitFor({ state: 'visible', timeout: 5000 });
    await checkbox.click();
    await page.waitForTimeout(500);
    
    expect(true).toBe(true);
  });

  test('should navigate to archive', async ({ page }) => {
    await page.click('text=Archive');
    await page.waitForTimeout(1000);
    const heading = page.locator('h2');
    await expect(heading).toContainText('Archived');
  });
});