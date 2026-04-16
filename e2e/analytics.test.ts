import { expect, test } from '@playwright/test';

test('Google Analytics tracks page views on initial load and client-side routing', async ({
  page,
}) => {
  await page.route('**/gtag/js?id=*', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `
window.gtag = function gtag() {
  const args = Array.from(arguments);
  if (args[0] !== 'config') {
    return;
  }

  const options = args[2];
  const pagePath =
    options && typeof options === 'object' && 'page_path' in options && options.page_path
      ? String(options.page_path)
      : location.pathname;
  const url = new URL('https://www.google-analytics.com/g/collect');
  url.searchParams.set('en', 'page_view');
  url.searchParams.set('dp', pagePath);
  url.searchParams.set('tid', String(args[1] ?? ''));
  fetch(url.toString());
};

for (const entry of (window.dataLayer || []).slice()) {
  window.gtag.apply(null, Array.from(entry));
}
`,
    });
  });

  await page.route('**/*google-analytics.com/g/collect*', (route) =>
    route.abort()
  );

  const initialCollectPromise = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return (
      url.pathname === '/g/collect' &&
      url.searchParams.get('dp') === '/' &&
      url.searchParams.get('en') === 'page_view'
    );
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'matukoto blog'
  );

  const initialCollect = await initialCollectPromise;
  const initialUrl = new URL(initialCollect.url());
  expect(initialUrl.searchParams.get('tid')).toBe('G-TEST123456');

  const navigationCollectPromise = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return (
      url.pathname === '/g/collect' &&
      url.searchParams.get('dp') === '/articles/expo' &&
      url.searchParams.get('en') === 'page_view'
    );
  });

  await page.getByRole('link', { name: '関西万博2025感想' }).click();

  const navigationCollect = await navigationCollectPromise;
  const navigationUrl = new URL(navigationCollect.url());
  expect(navigationUrl.searchParams.get('tid')).toBe('G-TEST123456');
});
