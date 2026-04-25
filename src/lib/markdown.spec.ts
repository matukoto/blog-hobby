import { describe, expect, it } from 'vitest';

import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
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
