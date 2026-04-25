import { marked } from 'marked';

import { highlightCodeBlock } from './syntax-highlight';

type HighlightedHtmlToken = {
  type: 'html';
  raw: string;
  text: string;
  pre: boolean;
  block: boolean;
};

export async function renderMarkdown(markdown: string): Promise<string> {
  const tokens = marked.lexer(markdown);

  await Promise.all(
    marked.walkTokens(tokens, async (token) => {
      if (token.type !== 'code') {
        return;
      }

      const highlighted = await highlightCodeBlock(token.text, token.lang);
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
