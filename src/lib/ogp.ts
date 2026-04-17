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
