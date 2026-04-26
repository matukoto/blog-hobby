import { describe, expect, it } from 'vitest';

import {
  getAmazonLinkCardMetadata,
  normalizeAmazonUrl,
  renderAmazonLinkCardHtml,
} from './amazon-link-card';

describe('amazon-link-card', () => {
  it('normalizes amazon urls and rejects non-amazon urls', () => {
    expect(normalizeAmazonUrl('https://amzn.to/41ReZTI#fragment')).toBe(
      'https://amzn.to/41ReZTI'
    );
    expect(normalizeAmazonUrl('https://www.amazon.co.jp/dp/123')).toBe(
      'https://www.amazon.co.jp/dp/123'
    );
    expect(normalizeAmazonUrl('https://example.com/books')).toBeNull();
    expect(normalizeAmazonUrl('javascript:alert(1)')).toBeNull();
  });

  it('finds metadata by normalized amazon url', () => {
    const metadata = getAmazonLinkCardMetadata(
      {
        'https://amzn.to/41ReZTI': {
          title: 'みんなのコンピュータサイエンス',
          url: 'https://www.amazon.co.jp/dp/example',
          image: 'https://images.example.com/book.jpg',
          siteName: 'Amazon.co.jp',
        },
      },
      'https://amzn.to/41ReZTI#top'
    );

    expect(metadata).not.toBeNull();
    expect(metadata?.title).toBe('みんなのコンピュータサイエンス');
  });

  it('renders amazon card html with safe escaping', () => {
    const html = renderAmazonLinkCardHtml({
      href: 'https://amzn.to/41ReZTI',
      linkText: 'book',
      metadata: {
        title: '<script>alert(1)</script>',
        url: 'https://www.amazon.co.jp/dp/example',
        image: 'https://images.example.com/book.jpg',
        siteName: 'Amazon.co.jp',
      },
    });

    expect(html).toContain('class="amazon-link-card"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('class="amazon-link-card__image"');
  });
});
