import { marked } from 'marked';

import { highlightCodeBlock } from './syntax-highlight';

type HighlightedHtmlToken = {
  type: 'html';
  raw: string;
  text: string;
  pre: boolean;
  block: boolean;
};

const DEFAULT_FILENAME = 'snippet';

type CodeFenceMeta = {
  language?: string;
  filename: string;
};

function unquote(value: string): string {
  return value.replace(/^['"](.*)['"]$/, '$1');
}

function sanitizeFilename(value?: string): string {
  const normalized = value?.split(/[/\\]/).at(-1)?.trim();
  return normalized && normalized.length > 0 ? normalized : DEFAULT_FILENAME;
}

function parseCodeFenceMeta(rawInfo?: string): CodeFenceMeta {
  const info = rawInfo?.trim();
  if (!info) {
    return { filename: DEFAULT_FILENAME };
  }

  const [head, ...rest] = info.split(/\s+/).filter((token) => token.length > 0);
  if (!head) {
    return { filename: DEFAULT_FILENAME };
  }

  let language: string | undefined = head;
  let filename: string | undefined;

  const headSplitIndex = head.indexOf(':');
  if (headSplitIndex > 0) {
    language = head.slice(0, headSplitIndex);
    filename = head.slice(headSplitIndex + 1);
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

async function renderCodeBlock(code: string, rawInfo?: string): Promise<string> {
  const meta = parseCodeFenceMeta(rawInfo);
  const highlighted = await highlightCodeBlock(code, meta.language);

  return `
<div class="code-block">
  <div class="code-block__header">
    <span class="code-block__filename">${escapeHtml(meta.filename)}</span>
  </div>
  ${highlighted}
</div>`.trim();
}

export async function renderMarkdown(markdown: string): Promise<string> {
  const tokens = marked.lexer(markdown);

  await Promise.all(
    marked.walkTokens(tokens, async (token) => {
      if (token.type !== 'code') {
        return;
      }

      const highlighted = await renderCodeBlock(token.text, token.lang);
      const htmlToken = token as unknown as HighlightedHtmlToken;

      htmlToken.type = 'html';
      htmlToken.raw = highlighted;
      htmlToken.text = highlighted;
      htmlToken.pre = true;
      htmlToken.block = true;
    })
  );

  return marked.parser(tokens).trim();
}
