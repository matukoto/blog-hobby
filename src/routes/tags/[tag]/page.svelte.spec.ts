import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import Page from './+page.svelte';
import { makePostSummary, makeTagPageData } from '$lib/testing/fixtures';

describe('/tags/[tag]/+page.svelte', () => {
  it('renders tagged posts', async () => {
    render(Page, {
      data: makeTagPageData({
        tag: { name: 'tech', slug: 'tech', count: 2 },
        posts: [makePostSummary({ tags: [{ name: 'tech', slug: 'tech' }] })],
      }),
    });

    await expect
      .element(page.getByRole('heading', { level: 1 }))
      .toHaveTextContent('tech');
    await expect
      .element(
        page.getByRole('link', { name: 'SvelteKit でブログを作ってみた' })
      )
      .toHaveAttribute('href', '/articles/first');
  });
});
