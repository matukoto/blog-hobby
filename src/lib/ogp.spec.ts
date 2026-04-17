import { describe, expect, it } from 'vitest';

import { getArticleOgpImagePath, getArticleOgpImageUrl } from './ogp';

describe('ogp', () => {
  it('builds the article ogp image path and url', () => {
    expect(getArticleOgpImagePath('first')).toBe('/ogp/first.png');
    expect(getArticleOgpImageUrl('https://example.com', 'first')).toBe(
      'https://example.com/ogp/first.png'
    );
  });
});
