import { createRequire } from 'node:module';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { Resvg } from '@resvg/resvg-js';
import { createFont, woff2 } from 'fonteditor-core';
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

const require = createRequire(import.meta.url);
const FONT_PROMISE = loadFonts();

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
  const titleLines = wrapText(post.title, 18, 3);
  const excerptLines = post.excerpt ? wrapText(post.excerpt, 28, 2) : [];
  const tagLine = post.tags.slice(0, 3).map((tag) => tag.name).join(' / ');
  const fonts = await FONT_PROMISE;
  const markup = createNode('div', {
    style: {
      width: '1200px',
      height: '630px',
      display: 'flex',
      boxSizing: 'border-box',
      padding: '64px',
      background: 'linear-gradient(135deg,#020617 0%,#0f172a 100%)',
      fontFamily: 'Hiragino Sans GB, Noto Sans JP, sans-serif',
      color: '#f8fafc',
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
                  color: '#cbd5e1',
                  fontSize: '28px',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                },
                children: 'matukoto blog',
              }),
              createNode('div', {
                style: {
                  display: 'flex',
                  marginTop: '12px',
                  color: '#93c5fd',
                  fontSize: '18px',
                  fontWeight: 600,
                },
                children: 'ARTICLE OGP',
              }),
            ],
          }),
          createNode('div', {
            style: {
              display: 'flex',
              flexDirection: 'column',
              fontSize: '64px',
              fontWeight: 800,
              lineHeight: 1.15,
            },
            children: titleLines.map((line, index) =>
              createNode('div', {
                style: {
                  display: 'flex',
                  marginTop: index === 0 ? 0 : '12px',
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
                  color: '#cbd5e1',
                  fontSize: '24px',
                  fontWeight: 600,
                },
                children: post.created,
              }),
              createNode('div', {
                style: {
                  display: 'flex',
                  marginTop: '8px',
                  color: '#94a3b8',
                  fontSize: '22px',
                  fontWeight: 500,
                },
                children: tagLine,
              }),
              createNode('div', {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  marginTop: '16px',
                  color: '#cbd5e1',
                  fontSize: '20px',
                  fontWeight: 500,
                  lineHeight: 1.4,
                },
                children: excerptLines.map((line, index) =>
                  createNode('div', {
                    style: {
                      display: 'flex',
                      marginTop: index === 0 ? 0 : '8px',
                    },
                    children: line,
                  })
                ),
              }),
            ],
          }),
        ],
      }),
      createNode('div', {
        style: {
          width: '348px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        },
        children: [
          createNode('div', {
            style: {
              borderRadius: '36px',
              background: 'linear-gradient(135deg,#38bdf8 0%,#8b5cf6 100%)',
              padding: '48px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
            },
            children: [
              createNode('div', {
                style: {
                  height: '20px',
                  borderRadius: '9999px',
                  background: 'rgba(248,250,252,0.85)',
                },
                children: '',
              }),
              createNode('div', {
                style: {
                  marginTop: '20px',
                  height: '20px',
                  width: '86%',
                  borderRadius: '9999px',
                  background: 'rgba(248,250,252,0.7)',
                },
                children: '',
              }),
              createNode('div', {
                style: {
                  marginTop: '20px',
                  height: '20px',
                  width: '68%',
                  borderRadius: '9999px',
                  background: 'rgba(248,250,252,0.55)',
                },
                children: '',
              }),
              createNode('div', {
                style: {
                  marginTop: '58px',
                  height: '168px',
                  borderRadius: '28px',
                  background: 'rgba(2,6,23,0.22)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                },
                children: [
                  createNode('div', {
                    style: {
                      display: 'flex',
                      color: '#ffffff',
                      fontSize: '42px',
                      fontWeight: 800,
                    },
                    children: 'OGP',
                  }),
                  createNode('div', {
                    style: {
                      display: 'flex',
                      marginTop: '10px',
                      color: '#e0f2fe',
                      fontSize: '22px',
                      fontWeight: 600,
                      wordBreak: 'break-all',
                    },
                    children: post.slug,
                  }),
                ],
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

  return `<!-- ${escapeXml(post.title)} | ${escapeXml(post.created)} | ${escapeXml(
    tagLine
  )} -->${svg}`;
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
  await woff2.init();

  return Promise.all([
    readFont('noto-sans-jp-0-400-normal'),
    readFont('noto-sans-jp-0-700-normal'),
  ]);
}

async function readFont(baseName: string): Promise<SatoriFont> {
  const fontPath = resolveFontPath(baseName);
  const data = await readFile(fontPath);
  const ttfBuffer = convertFontToTtf(data);

  return {
    data: ttfBuffer,
    name: 'Noto Sans JP',
    weight: baseName.includes('700') ? 700 : 400,
    style: 'normal',
  };
}

function resolveFontPath(baseName: string): string {
  const candidates = [
    `@fontsource/noto-sans-jp/files/${baseName}.woff2`,
    `@fontsource/noto-sans-jp/files/${baseName}.woff`,
    `@openfonts/noto-sans-jp_japanese/files/${baseName}.woff2`,
    `@openfonts/noto-sans-jp_japanese/files/${baseName}.woff`,
  ];

  for (const candidate of candidates) {
    try {
      return require.resolve(candidate);
    } catch {
      // Try the next font format.
    }
  }

  throw new Error(`Unable to resolve font file for ${baseName}`);
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

function convertFontToTtf(fontData: Buffer): Buffer {
  const font = createFont(fontData, { type: 'woff2' });
  const output = font.write({ type: 'ttf' });

  if (Buffer.isBuffer(output)) {
    return output;
  }

  return typeof output === 'string'
    ? Buffer.from(output)
    : Buffer.from(output as ArrayBuffer);
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
