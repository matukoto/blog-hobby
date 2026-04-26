import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { marked } from 'marked';

import {
  type AmazonLinkCardMetadata,
  type AmazonLinkCardSnapshot,
  normalizeAmazonUrl,
} from '../amazon-link-card';
import { splitFrontmatter } from '../post-parser';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

type GenerateAmazonLinkCardSnapshotOptions = {
  postsDir: string;
  outputFile: string;
  concurrency?: number;
  timeoutMs?: number;
  userAgent?: string;
  fetchFn?: FetchLike;
  logger?: Pick<Console, 'warn'>;
};

type LinkToken = {
  type: 'link';
  href: string;
};

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_CONCURRENCY = 4;
const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (compatible; matukoto-blog-bot/1.0; +https://matukoto.com)';
const FALLBACK_SITE_NAME = 'Amazon';

function isLinkToken(token: object): token is LinkToken {
  return (
    'type' in token &&
    'href' in token &&
    token.type === 'link' &&
    typeof token.href === 'string'
  );
}

function extractTitleTag(html: string): string | null {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = match?.[1]?.trim();
  return title && title.length > 0 ? decodeHtmlEntities(title) : null;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

function parseMetaTagAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const attributePattern =
    /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
  let match = attributePattern.exec(tag);

  while (match) {
    const key = match[1].toLowerCase();
    const value = match[3] ?? match[4] ?? match[5] ?? '';
    attributes[key] = decodeHtmlEntities(value.trim());
    match = attributePattern.exec(tag);
  }

  return attributes;
}

function parseMetaMap(html: string): Record<string, string> {
  const metaMap: Record<string, string> = {};
  const metaTagPattern = /<meta\b[^>]*>/gi;
  let tagMatch = metaTagPattern.exec(html);

  while (tagMatch) {
    const attributes = parseMetaTagAttributes(tagMatch[0]);
    const key = (attributes.property ?? attributes.name)?.toLowerCase();
    const content = attributes.content;

    if (key && content && !(key in metaMap)) {
      metaMap[key] = content;
    }

    tagMatch = metaTagPattern.exec(html);
  }

  return metaMap;
}

function toAbsoluteHttpUrl(
  rawUrl: string | undefined,
  baseUrl: string
): string | undefined {
  if (!rawUrl) {
    return undefined;
  }

  try {
    const absoluteUrl = new URL(rawUrl, baseUrl);
    if (absoluteUrl.protocol !== 'http:' && absoluteUrl.protocol !== 'https:') {
      return undefined;
    }

    absoluteUrl.hash = '';
    return absoluteUrl.toString();
  } catch {
    return undefined;
  }
}

function normalizeMetadataTitle(title?: string | null): string | null {
  const normalized = title?.replace(/\s+/g, ' ').trim();
  return normalized && normalized.length > 0 ? normalized : null;
}

export function extractAmazonUrlsFromMarkdown(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  const urls = new Set<string>();

  marked.walkTokens(tokens, (token) => {
    if (!isLinkToken(token)) {
      return;
    }

    const normalized = normalizeAmazonUrl(token.href);
    if (normalized) {
      urls.add(normalized);
    }
  });

  return [...urls];
}

export function extractAmazonLinkCardMetadataFromHtml(
  html: string,
  fallbackUrl: string
): AmazonLinkCardMetadata | null {
  const metaMap = parseMetaMap(html);
  const title =
    normalizeMetadataTitle(metaMap['og:title']) ??
    normalizeMetadataTitle(extractTitleTag(html));
  if (!title) {
    return null;
  }

  const url = toAbsoluteHttpUrl(metaMap['og:url'], fallbackUrl) ?? fallbackUrl;
  const image = toAbsoluteHttpUrl(metaMap['og:image'], url);
  const siteName = normalizeMetadataTitle(metaMap['og:site_name']);

  return {
    title,
    url,
    image,
    siteName: siteName ?? FALLBACK_SITE_NAME,
  };
}

async function readPostMarkdownFiles(postsDir: string): Promise<string[]> {
  const entries = await readdir(postsDir, { withFileTypes: true });
  const markdownSources: string[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) {
      continue;
    }

    const source = await readFile(join(postsDir, entry.name), 'utf8');
    const { markdown } = splitFrontmatter(source);
    markdownSources.push(markdown);
  }

  return markdownSources;
}

async function readSnapshotFile(
  outputFile: string
): Promise<AmazonLinkCardSnapshot> {
  try {
    const source = await readFile(outputFile, 'utf8');
    return JSON.parse(source) as AmazonLinkCardSnapshot;
  } catch {
    return {};
  }
}

function hasSameUrlKeys(
  snapshot: AmazonLinkCardSnapshot,
  urls: readonly string[]
): boolean {
  const snapshotKeys = Object.keys(snapshot).sort((left, right) =>
    left.localeCompare(right)
  );
  if (snapshotKeys.length !== urls.length) {
    return false;
  }

  return snapshotKeys.every((key, index) => key === urls[index]);
}

async function fetchAmazonLinkCardMetadata(
  url: string,
  fetchFn: FetchLike,
  options: {
    timeoutMs: number;
    userAgent: string;
    logger: Pick<Console, 'warn'>;
  }
): Promise<AmazonLinkCardMetadata | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    const response = await fetchFn(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': options.userAgent,
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      options.logger.warn(
        `[amazon-link-card] metadata fetch failed: ${url} (status: ${response.status})`
      );
      return null;
    }

    const html = await response.text();
    const metadata = extractAmazonLinkCardMetadataFromHtml(
      html,
      response.url || url
    );
    if (!metadata) {
      options.logger.warn(
        `[amazon-link-card] metadata parse failed: ${url} (missing title)`
      );
    }

    return metadata;
  } catch {
    options.logger.warn(
      `[amazon-link-card] metadata fetch failed: ${url} (network error)`
    );
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }

  const results = new Array<R>(items.length);
  let currentIndex = 0;
  const workerCount = Math.max(1, Math.min(concurrency, items.length));

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (true) {
        const index = currentIndex;
        currentIndex += 1;
        if (index >= items.length) {
          break;
        }

        results[index] = await mapper(items[index]);
      }
    })
  );

  return results;
}

export async function generateAmazonLinkCardSnapshot({
  postsDir,
  outputFile,
  concurrency = DEFAULT_CONCURRENCY,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  userAgent = DEFAULT_USER_AGENT,
  fetchFn = fetch as FetchLike,
  logger = console,
}: GenerateAmazonLinkCardSnapshotOptions): Promise<AmazonLinkCardSnapshot> {
  const markdownSources = await readPostMarkdownFiles(postsDir);
  const urls = [
    ...new Set(markdownSources.flatMap(extractAmazonUrlsFromMarkdown)),
  ];
  urls.sort((left, right) => left.localeCompare(right));
  const existingSnapshot = await readSnapshotFile(outputFile);
  if (hasSameUrlKeys(existingSnapshot, urls)) {
    return existingSnapshot;
  }

  const metadataList = await mapWithConcurrency(urls, concurrency, (url) =>
    fetchAmazonLinkCardMetadata(url, fetchFn, { timeoutMs, userAgent, logger })
  );

  const snapshot: AmazonLinkCardSnapshot = {};
  for (const [index, metadata] of metadataList.entries()) {
    if (!metadata) {
      continue;
    }

    snapshot[urls[index]] = metadata;
  }

  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');

  return snapshot;
}
