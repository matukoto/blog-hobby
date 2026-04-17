import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildArticleOgpSvg, generateArticleOgpImages } from './ogp';

describe('generateArticleOgpImages', () => {
  it('builds an svg with article metadata', async () => {
    const svg = await buildArticleOgpSvg({
      slug: 'first',
      title: 'ブログ記事のタイトル',
      created: '2024-09-20',
      updated: '2024-09-21',
      published: '2024-09-20',
      tags: [
        { name: 'Blog', slug: 'blog' },
        { name: 'Cloudflare', slug: 'cloudflare' },
      ],
      excerpt: '記事の要約',
      image: '/assets/svelte.png',
      unlisted: false,
      content: '',
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('ブログ記事のタイトル');
    expect(svg).toContain('2024-09-21');
    expect(svg).toContain('data:image/png;base64,');
    expect(svg).toContain('#ffffff');
    expect(svg).toContain('#f8fafc');
    expect(svg).toContain('#e2e8f0');
    expect(svg).not.toContain('Cloudflare');
    expect(svg).not.toContain('記事の要約');
  });

  it('writes png files for markdown posts', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'blog-hobby-ogp-'));
    const postsDir = join(workspace, 'posts');
    const outputDir = join(workspace, 'public');

    await mkdir(postsDir, { recursive: true });
    await writeFile(
      join(postsDir, 'first.md'),
      `---\n` +
        `title: ブログ記事のタイトル\n` +
        `created: 2024-09-20\n` +
        `updated: 2024-09-21\n` +
        `tags:\n` +
        `  - Blog\n` +
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
