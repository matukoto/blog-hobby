import { describe, expect, it } from 'vitest';

import { getAllPosts, getAllTags, getPost, getPostsByTag } from './posts';

describe('posts', () => {
  it('loads a post by slug', async () => {
    const post = await getPost('first');

    expect(post).not.toBeNull();
    expect(post?.slug).toBe('first');
    expect(post?.title).toBe('SvelteKit でブログを作ってみた');
    expect(post?.tags).toEqual([
      { name: 'Svelte', slug: 'svelte' },
      { name: 'Cloudflare', slug: 'cloudflare' },
      { name: 'tech', slug: 'tech' },
    ]);
    expect(post?.content).toContain('<h2>感想</h2>');
  });

  it('returns posts sorted by created date descending', async () => {
    const posts = await getAllPosts({ includeUnlisted: true });

    expect(posts.length).toBeGreaterThan(0);

    for (let index = 1; index < posts.length; index += 1) {
      expect(posts[index - 1].created >= posts[index].created).toBe(true);
    }
  });

  it('filters posts by tag slug', async () => {
    const posts = await getPostsByTag('tech', { includeUnlisted: true });

    expect(posts.length).toBeGreaterThan(0);
    expect(
      posts.every((post) => post.tags.some((tag) => tag.slug === 'tech'))
    ).toBe(true);
  });

  it('normalizes tag metadata', async () => {
    const tags = await getAllTags({ includeUnlisted: true });

    expect(tags).toContainEqual({
      name: 'OSS',
      slug: 'oss',
      count: 1,
    });
  });

  it('does not treat comment lines containing unlisted as unpublished', async () => {
    const posts = await getAllPosts();

    expect(posts.some((post) => post.slug === 'saiyou-kijun')).toBe(true);
  });
});
