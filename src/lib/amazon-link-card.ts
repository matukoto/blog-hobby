export type AmazonLinkCardMetadata = {
  title: string;
  url: string;
  image?: string;
  siteName?: string;
};

export type AmazonLinkCardSnapshot = Record<string, AmazonLinkCardMetadata>;

type RenderAmazonLinkCardHtmlOptions = {
  href: string;
  linkText: string;
  metadata: AmazonLinkCardMetadata;
};

const AMAZON_SHORT_HOSTS = new Set(['amzn.to', 'amzn.asia']);
const AMAZON_PREVIEW_IMAGE_PATTERN =
  /\/share-icons\/previewdoh\/amazon\.png(?:[?#].*)?$/i;

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

function extractAmazonAsin(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const match = url.pathname.match(
      /\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?:[/?]|$)/i
    );
    return match?.[1]?.toUpperCase() ?? null;
  } catch {
    return null;
  }
}

function toAmazonAsinImageUrl(asin: string): string {
  return `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`;
}

function resolveDisplayImage(rawImageUrl: string | undefined, pageUrl: string) {
  if (rawImageUrl && !AMAZON_PREVIEW_IMAGE_PATTERN.test(rawImageUrl)) {
    return rawImageUrl;
  }

  const asin = extractAmazonAsin(pageUrl);
  if (!asin) {
    return rawImageUrl;
  }

  return toAmazonAsinImageUrl(asin);
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
  const title = linkTitle.length > 0 ? linkTitle : metadata.title.trim() || safeHref;
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
