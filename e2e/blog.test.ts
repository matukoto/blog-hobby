import { expect, test } from '@playwright/test';

test('home, article, and tag pages are connected', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'blog hobby'
  );

  const firstArticleLink = page.getByRole('link', {
    name: '関西万博2025感想',
  });
  await expect(firstArticleLink).toBeVisible();
  await firstArticleLink.click();

  await expect(page).toHaveURL('/articles/expo');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    '関西万博2025感想'
  );

  await page.getByRole('link', { name: '旅行' }).click();

  await expect(page).toHaveURL('/tags/%E6%97%85%E8%A1%8C');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('旅行');
  await expect(
    page.getByRole('link', { name: '関西万博2025感想' })
  ).toBeVisible();
});

test('missing article returns a 404 page', async ({ page }) => {
  const response = await page.goto('/articles/does-not-exist');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('404');
});
