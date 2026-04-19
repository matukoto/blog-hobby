import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import {
  makeHomePageData,
  makePostSummary,
  makeTagSummary,
} from '$lib/testing/fixtures';

describe('/+page.svelte', () => {
  it('renders the article list and tag links', async () => {
    render(Page, {
      data: makeHomePageData({
        posts: [
          makePostSummary({
            excerpt: 'SvelteKit でブログを作ってみた感想です。',
            tags: [
              { name: 'svelte', slug: 'svelte' },
              { name: 'tech', slug: 'tech' },
            ],
          }),
        ],
        tags: [
          makeTagSummary({ name: 'svelte', slug: 'svelte' }),
          makeTagSummary({ name: 'tech', slug: 'tech' }),
        ],
      }),
    });

    await expect
      .element(page.getByRole('heading', { level: 1 }))
      .toHaveTextContent('matukoto blog');
    await expect
      .element(
        page.getByRole('link', { name: 'SvelteKit でブログを作ってみた' })
      )
      .toHaveAttribute('href', '/articles/first');
    await expect
      .element(
        page
          .getByRole('complementary', { name: 'タグ' })
          .getByRole('link', { name: 'tech' })
      )
      .toHaveAttribute('href', '/tags/tech');
  });
});
