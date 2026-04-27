import { marked } from 'marked';

import {
  type AmazonLinkCardSnapshot,
  getAmazonLinkCardMetadata,
  parseAmazonLinkCardSnapshotDocument,
  renderAmazonLinkCardHtml,
} from './amazon-link-card';
import amazonLinkCardData from './generated/amazon-link-card-data.json';
import { highlightCodeBlock } from './syntax-highlight';

type HighlightedHtmlToken = {
  type: 'html';
  raw: string;
  text: string;
  pre: boolean;
  block: boolean;
};

type InlineToken = {
  type: string;
  raw?: string;
  text?: string;
  href?: string;
};

type ParagraphToken = {
  type: 'paragraph';
  tokens?: InlineToken[];
};

const DEFAULT_EXTENSION = 'md';
const EXTENSION_BY_LANGUAGE: Record<string, string> = {
  bash: 'sh',
  csharp: 'cs',
  javascript: 'js',
  js: 'js',
  json: 'json',
  jsx: 'jsx',
  markdown: 'md',
  md: 'md',
  shell: 'sh',
  shellscript: 'sh',
  ts: 'ts',
  tsx: 'tsx',
  typescript: 'ts',
  yaml: 'yml',
  yml: 'yml',
};

type CodeFenceMeta = {
  language?: string;
  filename?: string;
};

type RenderMarkdownOptions = {
  amazonLinkCardSnapshot?: AmazonLinkCardSnapshot;
};

const DEFAULT_AMAZON_LINK_CARD_SNAPSHOT =
  parseAmazonLinkCardSnapshotDocument(amazonLinkCardData).entries;

function unquote(value: string): string {
  return value.replace(/^['"](.*)['"]$/, '$1');
}

function sanitizeFilename(value?: string): string | undefined {
  const normalized = value?.split(/[/\\]/).at(-1)?.trim();
  return normalized && normalized.length > 0 ? normalized : undefined;
}

function parseCodeFenceMeta(rawInfo?: string): CodeFenceMeta {
  const info = rawInfo?.trim();
  if (!info) {
    return {};
  }

  const [head, ...rest] = info.split(/\s+/).filter((token) => token.length > 0);
  if (!head) {
    return {};
  }

  let language: string | undefined;
  let filename: string | undefined;

  const headKeyValueMatch = head.match(/^(?:file|filename|name|title)=(.+)$/i);
  if (headKeyValueMatch) {
    filename = unquote(headKeyValueMatch[1]);
  } else {
    const headSplitIndex = head.indexOf(':');
    if (headSplitIndex > 0) {
      language = head.slice(0, headSplitIndex);
      filename = head.slice(headSplitIndex + 1);
    } else {
      language = head;
    }
  }

  for (const token of rest) {
    const keyValueMatch = token.match(/^(?:file|filename|name|title)=(.+)$/i);
    if (keyValueMatch) {
      filename = unquote(keyValueMatch[1]);
      continue;
    }

    if (!filename && token.includes('.') && !token.startsWith('{')) {
      filename = token;
    }
  }

  return {
    language: language?.trim(),
    filename: sanitizeFilename(filename),
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function extractExtension(filename?: string): string | undefined {
  if (!filename) {
    return undefined;
  }

  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex <= 0 || dotIndex === filename.length - 1) {
    return undefined;
  }

  const extension = filename.slice(dotIndex + 1).toLowerCase();
  return extension.length > 0 ? extension : undefined;
}

function resolveExtension(filename?: string, language?: string): string {
  const fromFilename = extractExtension(filename);
  if (fromFilename) {
    return fromFilename;
  }

  const normalizedLanguage = language?.trim().toLowerCase();
  if (normalizedLanguage) {
    const mappedExtension = EXTENSION_BY_LANGUAGE[normalizedLanguage];
    if (mappedExtension) {
      return mappedExtension;
    }

    const sanitizedLanguage = normalizedLanguage.replace(/[^a-z0-9]+/g, '');
    if (sanitizedLanguage.length > 0) {
      return sanitizedLanguage;
    }
  }

  return DEFAULT_EXTENSION;
}

function resolveFileLabel(meta: CodeFenceMeta): string {
  if (!meta.filename) {
    return resolveExtension(undefined, meta.language);
  }

  const existingExtension = extractExtension(meta.filename);
  if (existingExtension) {
    return meta.filename;
  }

  return `${meta.filename}.${resolveExtension(undefined, meta.language)}`;
}

async function renderCodeBlock(
  code: string,
  rawInfo?: string
): Promise<string> {
  const meta = parseCodeFenceMeta(rawInfo);
  const highlighted = await highlightCodeBlock(code, meta.language);
  const fileLabel = resolveFileLabel(meta);

  return `
<div class="code-block">
  <div class="code-block__header">
    <span class="code-block__file">${escapeHtml(fileLabel)}</span>
    <button
      type="button"
      class="code-block__copy"
      data-code-copy
      aria-label="copy code"
    >copy</button>
  </div>
  ${highlighted}
</div>`.trim();
}

function isIgnorableInlineToken(token: InlineToken): boolean {
  if (token.type === 'space') {
    return true;
  }

  if (token.type !== 'text') {
    return false;
  }

  const value = token.raw ?? token.text ?? '';
  return value.trim().length === 0;
}

function extractStandaloneLinkFromParagraph(
  token: ParagraphToken
): { href: string; text: string } | null {
  const inlineTokens = token.tokens ?? [];
  const meaningfulTokens = inlineTokens.filter(
    (inlineToken) => !isIgnorableInlineToken(inlineToken)
  );

  if (meaningfulTokens.length !== 1) {
    return null;
  }

  const [firstToken] = meaningfulTokens;
  if (firstToken.type !== 'link' || !firstToken.href) {
    return null;
  }

  return {
    href: firstToken.href,
    text: firstToken.text?.trim() ?? '',
  };
}

function renderAmazonLinkCardFromParagraph(
  token: ParagraphToken,
  amazonSnapshot: AmazonLinkCardSnapshot
): string | null {
  const standaloneLink = extractStandaloneLinkFromParagraph(token);
  if (!standaloneLink) {
    return null;
  }

  const metadata = getAmazonLinkCardMetadata(
    amazonSnapshot,
    standaloneLink.href
  );
  if (!metadata) {
    return null;
  }

  const cardHtml = renderAmazonLinkCardHtml({
    href: standaloneLink.href,
    linkText: standaloneLink.text,
    metadata,
  });

  return cardHtml.length > 0 ? cardHtml : null;
}

export async function renderMarkdown(
  markdown: string,
  options: RenderMarkdownOptions = {}
): Promise<string> {
  const amazonSnapshot =
    options.amazonLinkCardSnapshot ?? DEFAULT_AMAZON_LINK_CARD_SNAPSHOT;
  const tokens = marked.lexer(markdown);

  await Promise.all(
    marked.walkTokens(tokens, async (token) => {
      if (token.type === 'code') {
        const highlighted = await renderCodeBlock(token.text, token.lang);
        const htmlToken = token as unknown as HighlightedHtmlToken;

        htmlToken.type = 'html';
        htmlToken.raw = highlighted;
        htmlToken.text = highlighted;
        htmlToken.pre = true;
        htmlToken.block = true;
        return;
      }

      if (token.type !== 'paragraph') {
        return;
      }

      const amazonCardHtml = renderAmazonLinkCardFromParagraph(
        token as ParagraphToken,
        amazonSnapshot
      );
      if (!amazonCardHtml) {
        return;
      }

      const htmlToken = token as unknown as HighlightedHtmlToken;
      htmlToken.type = 'html';
      htmlToken.raw = amazonCardHtml;
      htmlToken.text = amazonCardHtml;
      htmlToken.pre = true;
      htmlToken.block = true;
    })
  );

  return marked.parser(tokens).trim();
}
