import { describe, expect, it } from 'vitest';

import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('renders a standalone amazon link as a card when snapshot metadata exists', async () => {
    const html = await renderMarkdown(
      '[みんなのコンピュータサイエンス](https://amzn.to/41ReZTI)',
      {
        amazonLinkCardSnapshot: {
          'https://amzn.to/41ReZTI': {
            title: 'Amazon',
            url: 'https://www.amazon.co.jp/dp/example',
            image: 'https://images.example.com/book.jpg',
            siteName: 'Amazon.co.jp',
          },
        },
      }
    );

    expect(html).toContain('class="amazon-link-card"');
    expect(html).toContain('みんなのコンピュータサイエンス');
    expect(html).not.toContain('amazon-link-card__title">Amazon<');
    expect(html).toContain('class="amazon-link-card__image"');
  });

  it('keeps inline amazon links as normal links', async () => {
    const html = await renderMarkdown(
      'この本 [みんなのコンピュータサイエンス](https://amzn.to/41ReZTI) が好きです。',
      {
        amazonLinkCardSnapshot: {
          'https://amzn.to/41ReZTI': {
            title: 'みんなのコンピュータサイエンス',
            url: 'https://www.amazon.co.jp/dp/example',
            image: 'https://images.example.com/book.jpg',
            siteName: 'Amazon.co.jp',
          },
        },
      }
    );

    expect(html).not.toContain('class="amazon-link-card"');
    expect(html).toContain('<p>');
    expect(html).toContain('<a href="https://amzn.to/41ReZTI">');
  });

  it('keeps standalone amazon links as normal links when metadata is missing', async () => {
    const html = await renderMarkdown(
      '[みんなのコンピュータサイエンス](https://amzn.to/41ReZTI)',
      {
        amazonLinkCardSnapshot: {},
      }
    );

    expect(html).not.toContain('class="amazon-link-card"');
    expect(html).toContain('<p><a href="https://amzn.to/41ReZTI">');
  });

  it('shows extension only when filename metadata is not specified', async () => {
    const html = await renderMarkdown('```ts\nconst answer = 42;\n```');

    expect(html).toContain('<div class="code-block">');
    expect(html).toContain('<span class="code-block__file">ts</span>');
    expect(html).toContain('class="code-block__copy"');
    expect(html).toContain('<pre class="shiki');
    expect(html).toContain('<code>');
    expect(html).toContain('<span');
  });

  it('shows filename and extension together when filename metadata is specified', async () => {
    const html = await renderMarkdown(
      '```ts filename=main.ts\nconst answer = 42;\n```'
    );

    expect(html).toContain('<span class="code-block__file">main.ts</span>');
  });

  it('appends extension from language when filename has no extension', async () => {
    const html = await renderMarkdown(
      '```ts filename=main\nconst answer = 42;\n```'
    );

    expect(html).toContain('<span class="code-block__file">main.ts</span>');
  });

  it('parses filename metadata even when info string starts with filename=', async () => {
    const html = await renderMarkdown(
      '```filename=main.ts\nconst answer = 42;\n```'
    );

    expect(html).toContain('<span class="code-block__file">main.ts</span>');
  });

  it('falls back to markdown highlighting when language is not specified', async () => {
    const html = await renderMarkdown('```\nhello();\n```');

    expect(html).toContain('<pre class="shiki');
    expect(html).toContain('hello');
  });
});
