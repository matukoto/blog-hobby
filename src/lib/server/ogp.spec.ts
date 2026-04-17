import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildArticleOgpSvg, generateArticleOgpImages } from './ogp';

describe('generateArticleOgpImages', () => {
  it('builds an svg with article metadata', async () => {
    const svg = await buildArticleOgpSvg({
      slug: 'first',
      title: 'SvelteKit でブログを作ってみた',
      created: '2024-09-20',
      updated: '2024-09-20',
      published: '2024-09-20',
      tags: [
        { name: 'Svelte', slug: 'svelte' },
        { name: 'Cloudflare', slug: 'cloudflare' },
      ],
      excerpt: '記事の要約',
      image: '/assets/svelte.png',
      unlisted: false,
      content: '',
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('SvelteKit でブログを作ってみた');
    expect(svg).toContain('2024-09-20');
    expect(svg).toContain('Svelte');
    expect(svg).toContain('data:image/svg+xml;base64,');
    expect(svg).toContain('#ffffff');
    expect(svg).toContain('#fff7f7');
  });

  it('writes png files for markdown posts', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'blog-hobby-ogp-'));
    const postsDir = join(workspace, 'posts');
    const outputDir = join(workspace, 'public');

    await mkdir(postsDir, { recursive: true });
    await writeFile(
      join(postsDir, 'first.md'),
      `---\n` +
        `title: SvelteKit でブログを作ってみた\n` +
        `created: 2024-09-20\n` +
        `updated: 2024-09-20\n` +
        `tags:\n` +
        `  - Svelte\n` +
        `  - Cloudflare\n` +
        `---\n\n` +
        `ブログの感想です。`
    );

    await generateArticleOgpImages({
      postsDir,
      outputDir,
    });

    const png = await readFile(join(outputDir, 'ogp', 'first.png'));

    expect(png.subarray(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  });
});
