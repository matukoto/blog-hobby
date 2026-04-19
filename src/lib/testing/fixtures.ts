import type { Post, PostSummary, PostTag, TagSummary } from '$lib/posts';

const DEFAULT_POST_TAGS: PostTag[] = [
  { name: 'svelte', slug: 'svelte' },
  { name: 'cloudflare', slug: 'cloudflare' },
];

export function makeTagSummary(overrides: Partial<TagSummary> = {}): TagSummary {
  return {
    name: 'tech',
    slug: 'tech',
    count: 1,
    ...overrides,
  };
}

export function makePostSummary(overrides: Partial<PostSummary> = {}): PostSummary {
  const { tags = DEFAULT_POST_TAGS, ...rest } = overrides;

  return {
    slug: 'first',
    title: 'SvelteKit でブログを作ってみた',
    image: '/assets/svelte.png',
    created: '2024-09-20',
    updated: '2024-09-20',
    published: '2024-09-20',
    excerpt: '記事の要約',
    tags: tags.map((tag) => ({ ...tag })),
    unlisted: false,
    ...rest,
  };
}

export function makePost(overrides: Partial<Post> = {}): Post {
  const { tags = DEFAULT_POST_TAGS, content = '<p>本文</p>', ...rest } = overrides;

  return {
    ...makePostSummary({
      tags,
      ...rest,
    }),
    content,
  };
}

export function makeHomePageData(overrides: {
  gaId?: string;
  posts?: PostSummary[];
  tags?: TagSummary[];
} = {}) {
  const {
    gaId = '',
    posts = [makePostSummary()],
    tags = [makeTagSummary()],
  } = overrides;

  return {
    gaId,
    posts,
    tags,
  };
}

export function makeArticlePageData(overrides: {
  gaId?: string;
  origin?: string;
  post?: Post;
} = {}) {
  const {
    gaId = '',
    origin = 'https://example.com',
    post = makePost(),
  } = overrides;

  return {
    gaId,
    origin,
    post,
  };
}

export function makeTagPageData(overrides: {
  gaId?: string;
  tag?: TagSummary;
  posts?: PostSummary[];
} = {}) {
  const {
    gaId = '',
    tag = makeTagSummary(),
    posts = [makePostSummary()],
  } = overrides;

  return {
    gaId,
    tag,
    posts,
  };
}
