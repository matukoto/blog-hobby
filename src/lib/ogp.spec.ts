import { describe, expect, it } from 'vitest';

import {
  buildArticleOgpSvg,
  getArticleOgpImagePath,
  getArticleOgpImageUrl,
} from './ogp';

describe('ogp', () => {
  it('builds the article ogp image path and url', () => {
    expect(getArticleOgpImagePath('first')).toBe('/ogp/first.png');
    expect(getArticleOgpImageUrl('https://example.com', 'first')).toBe(
      'https://example.com/ogp/first.png'
    );
  });

  it('renders article content into an svg card', () => {
    const svg = buildArticleOgpSvg({
      slug: 'first',
      title: 'SvelteKit でブログを作ってみた',
      image: '/assets/svelte.png',
      created: '2024-09-20',
      updated: '2024-09-20',
      published: '2024-09-20',
      excerpt: '記事の要約',
      tags: [
        { name: 'Svelte', slug: 'svelte' },
        { name: 'Cloudflare', slug: 'cloudflare' },
      ],
      unlisted: false,
      content: '',
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('SvelteKit でブログを作ってみた');
    expect(svg).toContain('2024-09-20');
    expect(svg).toContain('Svelte');
  });
});
