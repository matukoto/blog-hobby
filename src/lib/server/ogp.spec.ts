import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { generateArticleOgpImages } from './ogp';

describe('generateArticleOgpImages', () => {
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
