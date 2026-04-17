import { marked } from 'marked';

import {
  comparePostsByCreatedDesc,
  createExcerpt,
  createTag,
  parseFrontmatter,
  splitFrontmatter,
} from './post-parser';

type RawPostModule = Record<string, string>;
import type { PostTag, ParsedFrontmatter } from './post-parser';

export type { PostTag, ParsedFrontmatter };

export type PostSummary = {
  slug: string;
  title: string;
  image?: string;
  created: string;
  updated: string;
  published?: string;
  excerpt: string;
  tags: PostTag[];
  unlisted: boolean;
};

export type Post = PostSummary & {
  content: string;
};

export type TagSummary = {
  name: string;
  slug: string;
  count: number;
};

type GetPostsOptions = {
  includeUnlisted?: boolean;
};

const RAW_POSTS = import.meta.glob('/src/lib/posts/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as RawPostModule;

let postsPromise: Promise<Post[]> | undefined;

export async function getAllPosts(
  options: GetPostsOptions = {}
): Promise<PostSummary[]> {
  const posts = await loadPosts();

  return filterPosts(posts, options).map(toPostSummary);
}

export async function getPost(slug: string): Promise<Post | null> {
  const posts = await loadPosts();

  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getPostsByTag(
  tagSlug: string,
  options: GetPostsOptions = {}
): Promise<PostSummary[]> {
  const posts = await loadPosts();

  return filterPosts(posts, options)
    .filter((post) => post.tags.some((tag) => tag.slug === tagSlug))
    .map(toPostSummary);
}

export async function getAllTags(
  options: GetPostsOptions = {}
): Promise<TagSummary[]> {
  const posts = filterPosts(await loadPosts(), options);
  const tagCounts = new Map<string, TagSummary>();

  for (const post of posts) {
    for (const tag of post.tags) {
      const existing = tagCounts.get(tag.slug);
      if (existing) {
        existing.count += 1;
        continue;
      }

      tagCounts.set(tag.slug, {
        name: tag.name,
        slug: tag.slug,
        count: 1,
      });
    }
  }

  return [...tagCounts.values()].sort((left, right) =>
    left.name.localeCompare(right.name, 'ja')
  );
}

async function loadPosts(): Promise<Post[]> {
  postsPromise ??= Promise.all(
    Object.entries(RAW_POSTS).map(async ([path, source]) => {
      const slug = path.match(/\/src\/lib\/posts\/([^/]+)\.md$/)?.[1];
      if (!slug) {
        throw new Error(`Unexpected post path: ${path}`);
      }

      const { frontmatter, markdown } = splitFrontmatter(source);
      const metadata = parseFrontmatter(frontmatter);
      const content = await renderMarkdown(markdown, slug);

      return {
        slug,
        title: metadata.title,
        image: metadata.image,
        created: metadata.created,
        updated: metadata.updated,
        published: metadata.published,
        excerpt: createExcerpt(markdown),
        tags: metadata.tags.map(createTag),
        unlisted: metadata.unlisted,
        content,
      } satisfies Post;
    })
  ).then((posts) => posts.sort(comparePostsByCreatedDesc));

  return postsPromise;
}

async function renderMarkdown(markdown: string, slug: string): Promise<string> {
  const rendered = await marked.parse(markdown, {
    async: true,
  });

  return rendered.trim();
}

function filterPosts(posts: Post[], options: GetPostsOptions): Post[] {
  return posts.filter((post) => options.includeUnlisted || !post.unlisted);
}

function toPostSummary(post: Post): PostSummary {
  return {
    slug: post.slug,
    title: post.title,
    image: post.image,
    created: post.created,
    updated: post.updated,
    published: post.published,
    excerpt: post.excerpt,
    tags: post.tags,
    unlisted: post.unlisted,
  };
}
