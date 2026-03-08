import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import Page from './+page.svelte';

describe('/articles/[slug]/+page.svelte', () => {
  it('renders the article body and tag links', async () => {
    render(Page, {
      data: {
        post: {
          slug: 'first',
          title: 'SvelteKit でブログを作ってみた',
          image: '/assets/svelte.png',
          created: '2024-09-20',
          updated: '2024-09-20',
          published: '2024-09-20',
          excerpt: '記事の要約',
          tags: [
            { name: 'svelte', slug: 'svelte' },
            { name: 'cloudflare', slug: 'cloudflare' },
          ],
          content: '<h2>感想</h2><p>本文</p>',
          unlisted: false,
        },
      },
    });

    await expect
      .element(page.getByRole('heading', { level: 1 }))
      .toHaveTextContent('SvelteKit でブログを作ってみた');
    await expect
      .element(page.getByRole('heading', { level: 2 }))
      .toHaveTextContent('感想');
    await expect
      .element(page.getByRole('link', { name: 'svelte' }))
      .toHaveAttribute('href', '/tags/svelte');
  });
});
