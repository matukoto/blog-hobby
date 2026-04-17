import { normalizeSlug } from './slug';

export type PostTag = {
  name: string;
  slug: string;
};

export type ParsedFrontmatter = {
  title: string;
  image?: string;
  created: string;
  updated: string;
  published?: string;
  tags: string[];
  unlisted: boolean;
};

export function splitFrontmatter(source: string): {
  frontmatter: string;
  markdown: string;
} {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);

  if (!match) {
    throw new Error('Post source is missing frontmatter');
  }

  return {
    frontmatter: match[1],
    markdown: match[2].trim(),
  };
}

export function parseFrontmatter(frontmatter: string): ParsedFrontmatter {
  const lines = frontmatter.split('\n');
  const metadata: Partial<ParsedFrontmatter> & {
    tags: string[];
    unlisted: boolean;
  } = {
    tags: [],
    unlisted: false,
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();

    if (line.length === 0) {
      continue;
    }

    if (line.startsWith('#')) {
      continue;
    }

    const entry = line.match(/^([a-z]+):\s*(.*)$/i);
    if (!entry) {
      continue;
    }

    const [, key, rawValue] = entry;
    if (key === 'tags') {
      while (index + 1 < lines.length) {
        const nextLine = lines[index + 1].trim();
        const tagMatch = nextLine.match(/^-\s*(.*)$/);

        if (!tagMatch) {
          break;
        }

        metadata.tags.push(cleanScalar(tagMatch[1]));
        index += 1;
      }

      continue;
    }

    const value = cleanScalar(rawValue);

    if (key === 'image' && value.length === 0) {
      continue;
    }

    if (key === 'unlisted') {
      metadata.unlisted = value.toLowerCase() === 'true';
      continue;
    }

    metadata[key as keyof ParsedFrontmatter] = value as never;
  }

  if (!metadata.title || !metadata.created || !metadata.updated) {
    throw new Error('Post frontmatter is missing required fields');
  }

  return metadata as ParsedFrontmatter;
}

export function cleanScalar(value: string): string {
  return value
    .trim()
    .replace(/^['"](.*)['"]$/, '$1')
    .trim();
}

export function createTag(name: string): PostTag {
  const cleanedName = name.trim();
  const slug = normalizeSlug(cleanedName) ?? cleanedName.toLowerCase();

  return {
    name: cleanedName,
    slug,
  };
}

export function createExcerpt(markdown: string): string {
  const line = markdown
    .split('\n')
    .map((entry) => entry.trim())
    .find(
      (entry) =>
        entry.length > 0 && !entry.startsWith('#') && !entry.startsWith('- ')
    );

  if (!line) {
    return '';
  }

  return line
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function comparePostsByCreatedDesc<T extends { created: string }>(
  left: T,
  right: T
): number {
  return right.created.localeCompare(left.created);
}
