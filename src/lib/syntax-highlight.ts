import {
  bundledLanguages,
  getSingletonHighlighter,
  type BundledLanguage,
  type BundledTheme,
} from 'shiki';

const SHIKI_THEME: BundledTheme = 'github-light';
const PLAIN_TEXT_ALIASES = new Set(['plain', 'plaintext', 'text', 'txt']);
const FALLBACK_LANGUAGE: BundledLanguage = 'md';

const loadedLanguages = new Set<BundledLanguage>([FALLBACK_LANGUAGE]);

type ShikiHighlighter = Awaited<ReturnType<typeof getSingletonHighlighter>>;

let highlighterPromise: Promise<ShikiHighlighter> | undefined;

function parseLanguage(rawLanguage?: string): BundledLanguage {
  const candidate = rawLanguage
    ?.trim()
    .split(/\s+/)[0]
    ?.replace(/\{.*\}$/, '')
    .toLowerCase();

  if (!candidate || PLAIN_TEXT_ALIASES.has(candidate)) {
    return FALLBACK_LANGUAGE;
  }

  if (candidate in bundledLanguages) {
    return candidate as BundledLanguage;
  }

  return FALLBACK_LANGUAGE;
}

async function getHighlighter(): Promise<ShikiHighlighter> {
  highlighterPromise ??= getSingletonHighlighter({
    themes: [SHIKI_THEME],
    langs: [FALLBACK_LANGUAGE],
  });

  return highlighterPromise;
}

async function ensureLanguageLoaded(
  highlighter: ShikiHighlighter,
  language: BundledLanguage
): Promise<void> {
  if (loadedLanguages.has(language)) {
    return;
  }

  await highlighter.loadLanguage(language);
  loadedLanguages.add(language);
}

export async function highlightCodeBlock(
  code: string,
  rawLanguage?: string
): Promise<string> {
  const language = parseLanguage(rawLanguage);
  const highlighter = await getHighlighter();

  await ensureLanguageLoaded(highlighter, language);

  return highlighter.codeToHtml(code, {
    lang: language,
    theme: SHIKI_THEME,
  });
}
