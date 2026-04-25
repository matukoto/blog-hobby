import { describe, expect, it } from 'vitest';

import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('renders a fenced code block with shiki classes when language is specified', async () => {
    const html = await renderMarkdown('```ts\nconst answer = 42;\n```');

    expect(html).toContain('<div class="code-block">');
    expect(html).toContain('<span class="code-block__filename">snippet</span>');
    expect(html).toContain('<span class="code-block__extension">.ts</span>');
    expect(html).toContain('<pre class="shiki');
    expect(html).toContain('<code>');
    expect(html).toContain('<span');
  });

  it('renders filename metadata in the code block header', async () => {
    const html = await renderMarkdown(
      '```ts filename=main.ts\nconst answer = 42;\n```'
    );

    expect(html).toContain('<span class="code-block__filename">main</span>');
    expect(html).toContain('<span class="code-block__extension">.ts</span>');
  });

  it('falls back to plain-text highlighting when language is not specified', async () => {
    const html = await renderMarkdown('```\nhello();\n```');

    expect(html).toContain('<pre class="shiki');
    expect(html).toContain('hello');
  });
});
