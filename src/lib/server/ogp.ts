import { createRequire } from 'node:module';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { Resvg } from '@resvg/resvg-js';

import {
  createExcerpt,
  createTag,
  parseFrontmatter,
  splitFrontmatter,
} from '../post-parser';
import type { ArticleOgpPost } from '../ogp';
import { buildArticleOgpSvg } from '../ogp';

type GenerateArticleOgpImagesOptions = {
  postsDir: string;
  outputDir: string;
};

const require = createRequire(import.meta.url);
const FONT_PATH = require.resolve(
  '@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-400-normal.woff2'
);

export async function generateArticleOgpImages({
  postsDir,
  outputDir,
}: GenerateArticleOgpImagesOptions): Promise<void> {
  const posts = await readArticlePosts(postsDir);
  const ogpDir = join(outputDir, 'ogp');

  await rm(ogpDir, { recursive: true, force: true });
  await mkdir(ogpDir, { recursive: true });

  for (const post of posts) {
    const svg = buildArticleOgpSvg(post);
    const png = renderSvgToPng(svg);

    await writeFile(join(ogpDir, `${post.slug}.png`), png);
  }
}

async function readArticlePosts(postsDir: string): Promise<ArticleOgpPost[]> {
  const entries = await readdir(postsDir, { withFileTypes: true });
  const posts: ArticleOgpPost[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) {
      continue;
    }

    const slug = entry.name.slice(0, -3);
    const source = await readFile(join(postsDir, entry.name), 'utf8');
    const { frontmatter, markdown } = splitFrontmatter(source);
    const metadata = parseFrontmatter(frontmatter);

    posts.push({
      slug,
      title: metadata.title,
      created: metadata.created,
      updated: metadata.updated,
      published: metadata.published,
      tags: metadata.tags.map(createTag),
      excerpt: createExcerpt(markdown),
      image: metadata.image,
    });
  }

  return posts.sort((left, right) => right.created.localeCompare(left.created));
}

function renderSvgToPng(svg: string): Buffer {
  const resvg = new Resvg(svg, {
    font: {
      defaultFontFamily: 'Noto Sans JP',
      fontFiles: [FONT_PATH],
      loadSystemFonts: false,
    },
  });

  return Buffer.from(resvg.render().asPng());
}
