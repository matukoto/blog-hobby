import { test, expect } from '@playwright/test';

test('Google Analytics tracks page views on client-side routing', async ({
  page,
}) => {
  // 実際のアナリティクスへのリクエストをブロック（テストデータが送信されるのを防ぐ）
  await page.route('**/*google-analytics.com/g/collect*', (route) =>
    route.abort()
  );

  // 1. Playwrightでアプリケーションの画面を開く。
  await page.goto('/');

  // 初期ロードが完了するまで待機（初期ロード時のGAリクエストと区別するため）
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'blog hobby'
  );

  // 2. バックグラウンドで google-analytics.com/g/collect を含むURLへのリクエストの待機（監視）を開始する。
  const gaRequestPromise = page.waitForRequest((request) =>
    request.url().includes('google-analytics.com/g/collect')
  );

  // 3. 画面内のリンクをクリックし、SvelteKitのクライアントサイドルーティング（ページ遷移）を発生させる。
  await page.getByRole('link', { name: '関西万博2025感想' }).click();

  // 4. Playwrightが捕獲したリクエストのURLを解析し、パラメータに正しいイベント名（en=page_view）や、遷移先のパス（ep.page_path）が含まれているかをアサーション（検証）する。
  const gaRequest = await gaRequestPromise;
  const url = new URL(gaRequest.url());

  expect(url.searchParams.get('en')).toBe('page_view');
  expect(url.searchParams.get('dp')).toBe('/articles/expo');
});
