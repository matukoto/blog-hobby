import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import {
  extractAmazonLinkCardMetadataFromHtml,
  extractAmazonUrlsFromMarkdown,
  generateAmazonLinkCardSnapshot,
} from './amazon-link-card';

function createMockResponse({
  body,
  ok = true,
  status = 200,
  url,
}: {
  body: string;
  ok?: boolean;
  status?: number;
  url: string;
}): Response {
  return {
    ok,
    status,
    url,
    text: async () => body,
  } as unknown as Response;
}

describe('server/amazon-link-card', () => {
  it('extracts unique amazon urls from markdown links', () => {
    const markdown = `
[one](https://amzn.to/abc)
[two](https://www.amazon.co.jp/dp/123)
[dup](https://amzn.to/abc#fragment)
[other](https://example.com/path)
`;

    expect(extractAmazonUrlsFromMarkdown(markdown)).toEqual([
      'https://amzn.to/abc',
      'https://www.amazon.co.jp/dp/123',
    ]);
  });

  it('extracts metadata from ogp tags with fallback title', () => {
    const metadata = extractAmazonLinkCardMetadataFromHtml(
      `<html><head>
				<meta property="og:title" content="Amazonで買った本">
				<meta property="og:image" content="/image/book.jpg">
				<meta property="og:url" content="https://www.amazon.co.jp/dp/123">
			</head></html>`,
      'https://amzn.to/abc'
    );

    expect(metadata).not.toBeNull();
    expect(metadata?.title).toBe('Amazonで買った本');
    expect(metadata?.image).toBe('https://www.amazon.co.jp/image/book.jpg');
    expect(metadata?.url).toBe('https://www.amazon.co.jp/dp/123');
  });

  it('extracts product image from data-a-dynamic-image before og image', () => {
    const metadata = extractAmazonLinkCardMetadataFromHtml(
      `<html><body>
				<img
					id="landingImage"
					data-old-hires="https://m.media-amazon.com/images/I/high-res.jpg"
					data-a-dynamic-image="{&quot;https://m.media-amazon.com/images/I/large.jpg&quot;:[1200,1200],&quot;https://m.media-amazon.com/images/I/small.jpg&quot;:[500,500]}"
				>
				<meta property="og:title" content="Amazon">
				<meta property="og:image" content="https://m.media-amazon.com/images/G/01/share-icons/previewdoh/amazon.png">
				<meta property="og:url" content="https://www.amazon.co.jp/dp/B00E0DMA38">
			</body></html>`,
      'https://amzn.to/abc'
    );

    expect(metadata).not.toBeNull();
    expect(metadata?.image).toBe(
      'https://m.media-amazon.com/images/I/large.jpg'
    );
  });

  it('builds snapshot file and skips failed links', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'blog-hobby-amazon-card-'));
    const postsDir = join(workspace, 'posts');
    const outputFile = join(
      workspace,
      'generated',
      'amazon-link-card-data.json'
    );

    await mkdir(postsDir, { recursive: true });
    await writeFile(
      join(postsDir, 'first.md'),
      `---\n` +
        `title: テスト記事\n` +
        `created: 2024-01-01\n` +
        `updated: 2024-01-01\n` +
        `tags:\n` +
        `  - test\n` +
        `---\n\n` +
        `[ok](https://amzn.to/ok)\n\n` +
        `[ng](https://amzn.to/ng)\n`
    );

    const logger = { warn: vi.fn() };
    const fetchFn = vi.fn(async (input: string) => {
      if (input === 'https://amzn.to/ok') {
        return createMockResponse({
          url: 'https://www.amazon.co.jp/dp/ok',
          body: `<meta property="og:title" content="成功した本">
						<meta property="og:image" content="https://images.example.com/ok.jpg">
						<meta property="og:url" content="https://www.amazon.co.jp/dp/ok">`,
        });
      }

      return createMockResponse({
        url: input,
        ok: false,
        status: 500,
        body: 'error',
      });
    });

    const snapshot = await generateAmazonLinkCardSnapshot({
      postsDir,
      outputFile,
      fetchFn,
      logger,
      concurrency: 2,
    });

    expect(snapshot).toEqual({
      'https://amzn.to/ok': {
        title: '成功した本',
        image: 'https://images.example.com/ok.jpg',
        url: 'https://www.amazon.co.jp/dp/ok',
        siteName: 'Amazon',
      },
    });
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(fetchFn).toHaveBeenCalledTimes(2);

    const written = await readFile(outputFile, 'utf8');
    expect(JSON.parse(written)).toEqual({
      version: 2,
      entries: snapshot,
    });
  });

  it('refreshes snapshot when cached metadata quality is low', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'blog-hobby-amazon-card-'));
    const postsDir = join(workspace, 'posts');
    const outputFile = join(
      workspace,
      'generated',
      'amazon-link-card-data.json'
    );

    await mkdir(postsDir, { recursive: true });
    await writeFile(
      join(postsDir, 'first.md'),
      `---\n` +
        `title: テスト記事\n` +
        `created: 2024-01-01\n` +
        `updated: 2024-01-01\n` +
        `tags:\n` +
        `  - test\n` +
        `---\n\n` +
        `[ok](https://amzn.to/ok)\n`
    );
    await mkdir(join(workspace, 'generated'), { recursive: true });
    await writeFile(
      outputFile,
      JSON.stringify(
        {
          version: 1,
          entries: {
            'https://amzn.to/ok': {
              title: 'Amazon',
              url: 'https://www.amazon.co.jp/dp/ok',
              image:
                'https://m.media-amazon.com/images/G/01/share-icons/previewdoh/amazon.png',
              siteName: 'Amazon',
            },
          },
        },
        null,
        2
      )
    );

    const fetchFn = vi.fn(async () =>
      createMockResponse({
        url: 'https://www.amazon.co.jp/dp/B00E0DMA38',
        body: `<meta property="og:title" content="Amazon">
					<meta property="og:image" content="https://m.media-amazon.com/images/G/01/share-icons/previewdoh/amazon.png">
					<meta property="og:url" content="https://www.amazon.co.jp/dp/B00E0DMA38">`,
      })
    );

    const snapshot = await generateAmazonLinkCardSnapshot({
      postsDir,
      outputFile,
      fetchFn,
      logger: { warn: vi.fn() },
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(snapshot['https://amzn.to/ok']?.image).toBeUndefined();
  });
});
