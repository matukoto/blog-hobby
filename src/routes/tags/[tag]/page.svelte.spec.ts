import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import Page from './+page.svelte';

describe('/tags/[tag]/+page.svelte', () => {
  it('renders tagged posts', async () => {
    render(Page, {
      data: {
        gaId: '',
        tag: { name: 'tech', slug: 'tech', count: 2 },
        posts: [
          {
            slug: 'first',
            title: 'SvelteKit でブログを作ってみた',
            image: '/assets/svelte.png',
            created: '2024-09-20',
            updated: '2024-09-20',
            published: '2024-09-20',
            excerpt: '記事の要約',
            tags: [{ name: 'tech', slug: 'tech' }],
            unlisted: false,
          },
        ],
      },
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
