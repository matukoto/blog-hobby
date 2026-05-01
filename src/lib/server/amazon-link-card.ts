import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { marked } from 'marked';

import {
  AMAZON_LINK_CARD_SNAPSHOT_VERSION,
  createAmazonLinkCardSnapshotDocument,
  type AmazonLinkCardMetadata,
  type AmazonLinkCardSnapshotDocument,
  type AmazonLinkCardSnapshot,
  normalizeAmazonUrl,
  parseAmazonLinkCardSnapshotDocument,
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
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36';
const DEFAULT_ACCEPT_LANGUAGE = 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7';
const FALLBACK_SITE_NAME = 'Amazon';
const AMAZON_PREVIEW_IMAGE_PATTERN =
  /\/share-icons\/previewdoh\/amazon\.png(?:[?#].*)?$/i;

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

function isAmazonPreviewImage(rawUrl?: string): boolean {
  return rawUrl ? AMAZON_PREVIEW_IMAGE_PATTERN.test(rawUrl) : false;
}

function decodeHtmlAttribute(value: string): string {
  return decodeHtmlEntities(value)
    .replaceAll('&quot;', '"')
    .replaceAll('&#34;', '"');
}

function extractUrlsFromDynamicImagePayload(
  payload: string,
  baseUrl: string
): string[] {
  const decoded = decodeHtmlAttribute(payload);

  try {
    const parsed = JSON.parse(decoded) as Record<string, [number, number]>;
    return Object.entries(parsed)
      .map(([url, size]) => ({
        url: toAbsoluteHttpUrl(url, baseUrl),
        area: Array.isArray(size) ? size[0] * size[1] : 0,
      }))
      .filter((entry): entry is { url: string; area: number } => !!entry.url)
      .sort((left, right) => right.area - left.area)
      .map((entry) => entry.url);
  } catch {
    return [];
  }
}

function extractImageCandidatesFromHtml(
  html: string,
  baseUrl: string
): string[] {
  const candidates: string[] = [];

  const dynamicImagePattern = /data-a-dynamic-image=(["'])([\s\S]*?)\1/gi;
  let dynamicImageMatch = dynamicImagePattern.exec(html);
  while (dynamicImageMatch) {
    candidates.push(
      ...extractUrlsFromDynamicImagePayload(dynamicImageMatch[2], baseUrl)
    );
    dynamicImageMatch = dynamicImagePattern.exec(html);
  }

  const oldHiResPattern = /data-old-hires=(["'])(.*?)\1/gi;
  let oldHiResMatch = oldHiResPattern.exec(html);
  while (oldHiResMatch) {
    const url = toAbsoluteHttpUrl(
      decodeHtmlAttribute(oldHiResMatch[2]),
      baseUrl
    );
    if (url) {
      candidates.push(url);
    }
    oldHiResMatch = oldHiResPattern.exec(html);
  }

  const scriptImagePattern =
    /"(?:hiRes|large|mainUrl|url)"\s*:\s*"([^"]*m\.media-amazon\.com\/images\/I\/[^"]+)"/gi;
  let scriptImageMatch = scriptImagePattern.exec(html);
  while (scriptImageMatch) {
    const url = toAbsoluteHttpUrl(
      decodeHtmlAttribute(scriptImageMatch[1]),
      baseUrl
    );
    if (url) {
      candidates.push(url);
    }
    scriptImageMatch = scriptImagePattern.exec(html);
  }

  return [...new Set(candidates)];
}

function resolveAmazonImage(
  rawImageUrl: string | undefined,
  html: string,
  pageUrl: string
) {
  const htmlImage = extractImageCandidatesFromHtml(html, pageUrl).find(
    (candidate) => !isAmazonPreviewImage(candidate)
  );
  if (htmlImage) {
    return htmlImage;
  }

  if (rawImageUrl && !isAmazonPreviewImage(rawImageUrl)) {
    return rawImageUrl;
  }

  return undefined;
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
  const image = resolveAmazonImage(
    toAbsoluteHttpUrl(metaMap['og:image'], url),
    html,
    url
  );
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
): Promise<AmazonLinkCardSnapshotDocument> {
  try {
    const source = await readFile(outputFile, 'utf8');
    return parseAmazonLinkCardSnapshotDocument(JSON.parse(source));
  } catch {
    return createAmazonLinkCardSnapshotDocument({});
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

function hasReusableSnapshotData(
  snapshotDocument: AmazonLinkCardSnapshotDocument,
  urls: readonly string[]
): boolean {
  if (snapshotDocument.version !== AMAZON_LINK_CARD_SNAPSHOT_VERSION) {
    return false;
  }

  const snapshot = snapshotDocument.entries;
  if (!hasSameUrlKeys(snapshot, urls)) {
    return false;
  }

  return true;
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
        'accept-language': DEFAULT_ACCEPT_LANGUAGE,
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
  const existingSnapshotDocument = await readSnapshotFile(outputFile);
  const existingSnapshot = existingSnapshotDocument.entries;
  if (hasReusableSnapshotData(existingSnapshotDocument, urls)) {
    return existingSnapshot;
  }

  const metadataList = await mapWithConcurrency(urls, concurrency, (url) =>
    fetchAmazonLinkCardMetadata(url, fetchFn, { timeoutMs, userAgent, logger })
  );

  const snapshot: AmazonLinkCardSnapshot = {};
  for (const [index, metadata] of metadataList.entries()) {
    const url = urls[index];
    if (metadata) {
      snapshot[url] = metadata;
      continue;
    }

    const existingMetadata = existingSnapshot[url];
    if (existingMetadata) {
      snapshot[url] = existingMetadata;
    }
  }

  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(
    outputFile,
    `${JSON.stringify(createAmazonLinkCardSnapshotDocument(snapshot), null, 2)}\n`,
    'utf8'
  );

  return snapshot;
}
