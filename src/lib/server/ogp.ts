import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

import { createExcerpt, createTag, parseFrontmatter, splitFrontmatter } from '../post-parser';
import type { ArticleOgpPost } from '../ogp';

type SatoriNode = {
  type: string;
  props: {
    children?: SatoriNode | SatoriNode[] | string;
    style?: Record<string, string | number>;
    [key: string]: unknown;
  };
};

type SatoriFont = {
  data: Buffer | ArrayBuffer;
  name: string;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  style?: 'normal' | 'italic';
  lang?: string;
};

type GenerateArticleOgpImagesOptions = {
  postsDir: string;
  outputDir: string;
};

const FONT_PROMISE = loadFonts();
const BLOG_ICON_PROMISE = loadBlogIcon();

export async function generateArticleOgpImages({
  postsDir,
  outputDir,
}: GenerateArticleOgpImagesOptions): Promise<void> {
  const posts = await readArticlePosts(postsDir);
  const ogpDir = join(outputDir, 'ogp');

  await rm(ogpDir, { recursive: true, force: true });
  await mkdir(ogpDir, { recursive: true });

  for (const post of posts) {
    const svg = await buildArticleOgpSvg(post);
    const png = renderSvgToPng(svg);

    await writeFile(join(ogpDir, `${post.slug}.png`), png);
  }
}

export async function buildArticleOgpSvg(post: ArticleOgpPost): Promise<string> {
  const titleLines = wrapText(post.title, 20, 3);
  const updatedAt = post.updated ?? post.created;
  const [fonts, blogIcon] = await Promise.all([FONT_PROMISE, BLOG_ICON_PROMISE]);
  const markup = createNode('div', {
    style: {
      width: '1200px',
      height: '630px',
      display: 'flex',
      boxSizing: 'border-box',
      padding: '72px',
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      fontFamily: 'Noto Sans JP',
      color: '#0f172a',
    },
    children: [
      createNode('div', {
        style: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingRight: '48px',
        },
        children: [
          createNode('div', {
            style: {
              display: 'flex',
              flexDirection: 'column',
            },
            children: [
              createNode('div', {
                style: {
                  display: 'flex',
                  color: '#0f172a',
                  fontSize: '28px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                },
                children: 'matukoto blog',
              }),
              createNode('div', {
                style: {
                  marginTop: '14px',
                  height: '4px',
                  width: '80px',
                  borderRadius: '9999px',
                  background: '#ff3e00',
                },
                children: '',
              }),
            ],
          }),
          createNode('div', {
            style: {
              display: 'flex',
              flexDirection: 'column',
              fontSize: '68px',
              fontWeight: 700,
              lineHeight: 1.15,
            },
            children: titleLines.map((line, index) =>
              createNode('div', {
                style: {
                  display: 'flex',
                  marginTop: index === 0 ? 0 : '14px',
                },
                children: line,
              })
            ),
          }),
          createNode('div', {
            style: {
              display: 'flex',
              flexDirection: 'column',
            },
            children: [
              createNode('div', {
                style: {
                  display: 'flex',
                  color: '#475569',
                  fontSize: '18px',
                  fontWeight: 400,
                  letterSpacing: '0.08em',
                },
                children: '更新日',
              }),
              createNode('div', {
                style: {
                  display: 'flex',
                  marginTop: '8px',
                  color: '#0f172a',
                  fontSize: '28px',
                  fontWeight: 700,
                },
                children: updatedAt,
              }),
            ],
          }),
        ],
      }),
      createNode('div', {
        style: {
          width: '300px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        },
        children: [
          createNode('div', {
            style: {
              width: '240px',
              height: '240px',
              borderRadius: '28px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
            children: [
              createNode('img', {
                width: 176,
                height: 176,
                style: {
                  width: '176px',
                  height: '176px',
                  objectFit: 'contain',
                },
                src: blogIcon,
                alt: 'matukoto blog icon',
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const svg = await satori(markup, {
    width: 1200,
    height: 630,
    fonts,
  });

  return `<!-- ${escapeXml(post.title)} | ${escapeXml(updatedAt)} -->${svg}`;
}

async function loadBlogIcon(): Promise<string> {
  const iconPath = join(process.cwd(), 'static/assets/favicon.svg');
  const icon = await readFile(iconPath, 'utf8');
  const embeddedImage = icon.match(/xlink:href="(data:image\/png;base64,[^"]+)"/)?.[1];

  if (embeddedImage) {
    return embeddedImage;
  }

  return `data:image/svg+xml;base64,${Buffer.from(icon).toString('base64')}`;
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
  const resvg = new Resvg(svg);

  return Buffer.from(resvg.render().asPng());
}

async function loadFonts(): Promise<SatoriFont[]> {
  return Promise.all([
    readFont('noto-sans-jp-japanese-400.ttf', 400),
    readFont('noto-sans-jp-japanese-700.ttf', 700),
  ]);
}

async function readFont(fileName: string, weight: 400 | 700): Promise<SatoriFont> {
  const fontPath = join(process.cwd(), 'src/lib/assets/ogp-fonts', fileName);
  const data = await readFile(fontPath);

  return {
    data,
    name: 'Noto Sans JP',
    weight,
    style: 'normal',
  };
}

function wrapText(text: string, maxCharactersPerLine: number, maxLines: number): string[] {
  const characters = Array.from(text.trim());

  if (characters.length === 0) {
    return [];
  }

  const lines: string[] = [];
  let currentLine = '';

  for (const character of characters) {
    const nextLine = `${currentLine}${character}`;

    if (Array.from(nextLine).length > maxCharactersPerLine && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = character;

      if (lines.length === maxLines - 1) {
        break;
      }

      continue;
    }

    currentLine = nextLine;
  }

  if (currentLine.length > 0 && lines.length < maxLines) {
    lines.push(currentLine);
  }

  const remainderIndex = lines.join('').length;
  if (remainderIndex < characters.length && lines.length > 0) {
    lines[lines.length - 1] = `${lines[lines.length - 1]}…`;
  }

  return lines;
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function createNode(
  type: string,
  props: Record<string, unknown> & { children?: SatoriNode[] | SatoriNode | string }
): SatoriNode {
  return {
    type,
    props: {
      ...props,
    },
  };
}
