import type { PostTag } from './post-parser';

export type ArticleOgpPost = {
  slug: string;
  title: string;
  created: string;
  updated?: string;
  published?: string;
  tags: PostTag[];
  excerpt?: string;
  image?: string;
  unlisted?: boolean;
  content?: string;
};

const SITE_NAME = 'matukoto blog';
const OGP_IMAGE_BASE_PATH = '/ogp';

export function getArticleOgpImagePath(slug: string): string {
  if (slug.trim().length === 0) {
    throw new Error('Article slug is required');
  }

  return `${OGP_IMAGE_BASE_PATH}/${encodeURIComponent(slug)}.png`;
}

export function getArticleOgpImageUrl(origin: string, slug: string): string {
  return new URL(getArticleOgpImagePath(slug), origin).toString();
}

export function buildArticleOgpSvg(post: ArticleOgpPost): string {
  const titleLines = wrapText(post.title, 18, 3);
  const excerptLines = post.excerpt ? wrapText(post.excerpt, 28, 2) : [];
  const tagLine = post.tags.slice(0, 3).map((tag) => tag.name).join(' / ');

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
  <title>${escapeXml(`${post.title} | ${SITE_NAME}`)}</title>
  <desc>${escapeXml(
    [post.created, tagLine, post.excerpt ?? ''].filter(Boolean).join(' / ')
  )}</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop stop-color="#020617" />
      <stop offset="1" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="accent" x1="760" y1="90" x2="1100" y2="540" gradientUnits="userSpaceOnUse">
      <stop stop-color="#38bdf8" stop-opacity="0.95" />
      <stop offset="1" stop-color="#8b5cf6" stop-opacity="0.95" />
    </linearGradient>
    <filter id="shadow" x="736" y="84" width="376" height="462" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#020617" flood-opacity="0.35" />
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)" />
  <circle cx="1032" cy="126" r="148" fill="#0f172a" />
  <circle cx="1108" cy="468" r="112" fill="#1d4ed8" opacity="0.16" />
  <circle cx="884" cy="466" r="72" fill="#38bdf8" opacity="0.16" />

  <text x="72" y="88" fill="#cbd5e1" font-size="28" font-weight="700" letter-spacing="0.16em" font-family="Noto Sans JP, sans-serif">${escapeXml(
    SITE_NAME
  )}</text>
  <text x="72" y="138" fill="#93c5fd" font-size="18" font-weight="600" font-family="Noto Sans JP, sans-serif">ARTICLE OGP</text>

  <text x="72" y="224" fill="#f8fafc" font-size="64" font-weight="800" font-family="Noto Sans JP, sans-serif">
    ${titleLines
      .map(
        (line, index) =>
          `<tspan x="72" dy="${index === 0 ? 0 : 1.18}em">${escapeXml(line)}</tspan>`
      )
      .join('')}
  </text>

  <text x="72" y="472" fill="#cbd5e1" font-size="24" font-weight="600" font-family="Noto Sans JP, sans-serif">${escapeXml(
    post.created
  )}</text>
  <text x="72" y="510" fill="#94a3b8" font-size="22" font-weight="500" font-family="Noto Sans JP, sans-serif">${escapeXml(
    tagLine
  )}</text>

  ${excerptLines
    .map(
      (line, index) =>
        `<text x="72" y="${560 + index * 30}" fill="#cbd5e1" font-size="20" font-weight="500" font-family="Noto Sans JP, sans-serif">${escapeXml(
          line
        )}</text>`
    )
    .join('')}

  <g filter="url(#shadow)">
    <rect x="780" y="112" width="348" height="400" rx="36" fill="url(#accent)" />
    <rect x="824" y="158" width="260" height="20" rx="10" fill="#f8fafc" opacity="0.85" />
    <rect x="824" y="198" width="220" height="20" rx="10" fill="#f8fafc" opacity="0.7" />
    <rect x="824" y="238" width="180" height="20" rx="10" fill="#f8fafc" opacity="0.55" />
    <rect x="824" y="314" width="260" height="168" rx="28" fill="#020617" opacity="0.22" />
    <text x="844" y="386" fill="#ffffff" font-size="42" font-weight="800" font-family="Noto Sans JP, sans-serif">OGP</text>
    <text x="844" y="430" fill="#e0f2fe" font-size="22" font-weight="600" font-family="Noto Sans JP, sans-serif">${escapeXml(
      post.slug
    )}</text>
  </g>
</svg>`.trim();
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
