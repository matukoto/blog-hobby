import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import Page from './+page.svelte';
import { makeArticlePageData, makePost } from '$lib/testing/fixtures';

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation(
      () =>
        ({
          addListener: vi.fn(),
          addEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
          matches,
          media: '(pointer: fine)',
          onchange: null,
          removeListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as MediaQueryList
    ),
  });
}

describe('/articles/[slug]/+page.svelte', () => {
  it('renders the article body and tag links', async () => {
    render(Page, {
      data: makeArticlePageData({
        post: makePost({
          tags: [
            { name: 'svelte', slug: 'svelte' },
            { name: 'cloudflare', slug: 'cloudflare' },
          ],
          content: `
            <h1>導入</h1>
            <h2>感想</h2>
            <h3>補足</h3>
            <h4>詳細</h4>
            <h5>メモ</h5>
            <p>本文</p>
          `,
        }),
      }),
    });

    await expect
      .element(
        page.getByRole('heading', {
          level: 1,
          name: 'SvelteKit でブログを作ってみた',
        })
      )
      .toHaveTextContent('SvelteKit でブログを作ってみた');
    await expect
      .element(page.getByRole('heading', { level: 2 }))
      .toHaveTextContent('感想');
    expect(
      getComputedStyle(
        document.querySelector('.article-content h1') as HTMLElement
      ).borderBottomStyle
    ).toBe('solid');
    expect(
      getComputedStyle(
        document.querySelector('.article-content h2') as HTMLElement
      ).borderBottomStyle
    ).toBe('double');
    expect(
      getComputedStyle(
        document.querySelector('.article-content h3') as HTMLElement
      ).borderBottomStyle
    ).toBe('dashed');
    expect(
      getComputedStyle(
        document.querySelector('.article-content h4') as HTMLElement
      ).borderBottomStyle
    ).toBe('dotted');
    expect(
      getComputedStyle(
        document.querySelector('.article-content h5') as HTMLElement
      ).borderBottomStyle
    ).toBe('groove');
    expect(
      getComputedStyle(
        document.querySelector('header.article-header h1') as HTMLElement
      ).borderBottomStyle
    ).toBe('none');
    await expect
      .element(page.getByRole('link', { name: 'svelte' }))
      .toHaveAttribute('href', '/tags/svelte');
    await expect
      .element(page.getByRole('button', { name: 'share' }))
      .toBeInTheDocument();
  });

  it('adds OGP meta tags for the article', async () => {
    render(Page, {
      data: makeArticlePageData({
        post: makePost({
          tags: [],
          content: '<p>本文</p>',
        }),
      }),
    });

    expect(
      document.head
        .querySelector('meta[property="og:title"]')
        ?.getAttribute('content')
    ).toBe('SvelteKit でブログを作ってみた | matukoto blog');
    expect(
      document.head
        .querySelector('meta[property="og:image"]')
        ?.getAttribute('content')
    ).toBe('https://example.com/ogp/first.png');
    expect(
      document.head
        .querySelector('meta[name="twitter:card"]')
        ?.getAttribute('content')
    ).toBe('summary_large_image');
  });

  it('copies the article metadata on desktop', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const share = vi.fn().mockResolvedValue(undefined);

    mockMatchMedia(true);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: share,
    });

    render(Page, {
      data: makeArticlePageData({
        post: makePost({
          tags: [],
          content: '<p>本文</p>',
        }),
      }),
    });

    await page.getByRole('button', { name: 'share' }).click();

    expect(writeText).toHaveBeenCalledWith(
      'SvelteKit でブログを作ってみた\nhttps://example.com/articles/first'
    );
    expect(share).not.toHaveBeenCalled();
    await expect
      .element(page.getByRole('button', { name: 'シェア済み' }))
      .toBeInTheDocument();
    expect(document.querySelector('.share-status')).toBeNull();
  });

  it('sends title, text and url to the mobile share target', async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    mockMatchMedia(false);
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: share,
    });

    render(Page, {
      data: {
        gaId: '',
        origin: 'https://example.com',
        post: {
          slug: 'first',
          title: 'SvelteKit でブログを作ってみた',
          image: '/assets/svelte.png',
          created: '2024-09-20',
          updated: '2024-09-20',
          published: '2024-09-20',
          excerpt: '記事の要約',
          tags: [],
          content: '<p>本文</p>',
          unlisted: false,
        },
      },
    });

    await page.getByRole('button', { name: 'share' }).click();

    expect(share).toHaveBeenCalledTimes(1);
    expect(share).toHaveBeenCalledWith({
      title: 'SvelteKit でブログを作ってみた',
      text: 'SvelteKit でブログを作ってみた',
      url: 'https://example.com/articles/first',
    });
  });

  it('copies only the url on mobile clipboard fallback', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    mockMatchMedia(false);
    Reflect.deleteProperty(navigator, 'share');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(Page, {
      data: makeArticlePageData({
        post: makePost({
          tags: [],
          content: '<p>本文</p>',
        }),
      }),
    });

    await page.getByRole('button', { name: 'share' }).click();

    expect(writeText).toHaveBeenCalledWith(
      'https://example.com/articles/first'
    );
    await expect
      .element(page.getByRole('button', { name: 'シェア済み' }))
      .toBeInTheDocument();
  });

  it('shows an error message when clipboard copy fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    const share = vi.fn().mockResolvedValue(undefined);

    mockMatchMedia(true);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: share,
    });

    render(Page, {
      data: makeArticlePageData({
        post: makePost({
          tags: [],
          content: '<p>本文</p>',
        }),
      }),
    });

    await page.getByRole('button', { name: 'share' }).click();

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(share).not.toHaveBeenCalled();
    await expect.element(page.getByText('エラー')).toBeInTheDocument();
  });
});
