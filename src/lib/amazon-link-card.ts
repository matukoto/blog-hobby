export type AmazonLinkCardMetadata = {
  title: string;
  url: string;
  image?: string;
  siteName?: string;
};

export type AmazonLinkCardSnapshot = Record<string, AmazonLinkCardMetadata>;
export type AmazonLinkCardSnapshotDocument = {
  version: number;
  entries: AmazonLinkCardSnapshot;
};

type RenderAmazonLinkCardHtmlOptions = {
  href: string;
  linkText: string;
  metadata: AmazonLinkCardMetadata;
};

const AMAZON_SHORT_HOSTS = new Set(['amzn.to', 'amzn.asia']);
const AMAZON_PREVIEW_IMAGE_PATTERN =
  /\/share-icons\/previewdoh\/amazon\.png(?:[?#].*)?$/i;
export const AMAZON_LINK_CARD_SNAPSHOT_VERSION = 2;

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/\.$/, '');
}

function isAmazonHostname(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);
  if (AMAZON_SHORT_HOSTS.has(normalized)) {
    return true;
  }

  return /(^|\.)amazon\.[a-z0-9.-]+$/i.test(normalized);
}

function isHttpUrl(url: URL): boolean {
  return url.protocol === 'http:' || url.protocol === 'https:';
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function sanitizeHttpUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    if (!isHttpUrl(url)) {
      return null;
    }

    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

function getDisplayHostname(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./i, '');
  } catch {
    return 'amazon';
  }
}

function resolveDisplayImage(rawImageUrl: string | undefined, pageUrl: string) {
  if (rawImageUrl && !AMAZON_PREVIEW_IMAGE_PATTERN.test(rawImageUrl)) {
    return rawImageUrl;
  }
  return undefined;
}

export function normalizeAmazonUrl(rawUrl: string): string | null {
  const sanitized = sanitizeHttpUrl(rawUrl);
  if (!sanitized) {
    return null;
  }

  const url = new URL(sanitized);
  if (!isAmazonHostname(url.hostname)) {
    return null;
  }

  return sanitized;
}

export function getAmazonLinkCardMetadata(
  snapshot: AmazonLinkCardSnapshot,
  rawUrl: string
): AmazonLinkCardMetadata | null {
  const normalized = normalizeAmazonUrl(rawUrl);
  if (!normalized) {
    return null;
  }

  return snapshot[normalized] ?? null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAmazonLinkCardMetadata(
  value: unknown
): value is AmazonLinkCardMetadata {
  return (
    isRecord(value) &&
    typeof value.title === 'string' &&
    typeof value.url === 'string' &&
    (value.image === undefined || typeof value.image === 'string') &&
    (value.siteName === undefined || typeof value.siteName === 'string')
  );
}

function sanitizeSnapshotEntries(value: unknown): AmazonLinkCardSnapshot {
  if (!isRecord(value)) {
    return {};
  }

  const entries: AmazonLinkCardSnapshot = {};
  for (const [key, entry] of Object.entries(value)) {
    if (key.startsWith('http') && isAmazonLinkCardMetadata(entry)) {
      entries[key] = entry;
    }
  }

  return entries;
}

export function parseAmazonLinkCardSnapshotDocument(
  value: unknown
): AmazonLinkCardSnapshotDocument {
  if (
    isRecord(value) &&
    typeof value.version === 'number' &&
    'entries' in value
  ) {
    return {
      version: value.version,
      entries: sanitizeSnapshotEntries(value.entries),
    };
  }

  return {
    version: 1,
    entries: sanitizeSnapshotEntries(value),
  };
}

export function createAmazonLinkCardSnapshotDocument(
  entries: AmazonLinkCardSnapshot
): AmazonLinkCardSnapshotDocument {
  return {
    version: AMAZON_LINK_CARD_SNAPSHOT_VERSION,
    entries,
  };
}

export function renderAmazonLinkCardHtml({
  href,
  linkText,
  metadata,
}: RenderAmazonLinkCardHtmlOptions): string {
  const safeHref = sanitizeHttpUrl(href);
  if (!safeHref) {
    return '';
  }

  const linkTitle = linkText.trim();
  const title =
    linkTitle.length > 0 ? linkTitle : metadata.title.trim() || safeHref;
  const cardUrl = metadata.url.trim() || safeHref;
  const hostname = getDisplayHostname(cardUrl);
  const resolvedImage = resolveDisplayImage(metadata.image, cardUrl);
  const imageHtml = resolvedImage
    ? `<img class="amazon-link-card__image" src="${escapeHtml(
        resolvedImage
      )}" alt="" loading="lazy" decoding="async">`
    : '';

  return `
<aside class="amazon-link-card">
	<a
		class="amazon-link-card__link"
		href="${escapeHtml(safeHref)}"
		target="_blank"
		rel="noopener noreferrer"
	>
		${imageHtml}
		<span class="amazon-link-card__content">
			<span class="amazon-link-card__badge">Amazon</span>
			<span class="amazon-link-card__title">${escapeHtml(title)}</span>
			<span class="amazon-link-card__url">${escapeHtml(hostname)}</span>
		</span>
	</a>
</aside>`.trim();
}
