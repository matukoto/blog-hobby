import type { PageServerLoad } from './$types';

import { getAllPosts, getAllTags } from '$lib/posts';

export const load: PageServerLoad = async () => {
  const [posts, tags] = await Promise.all([getAllPosts(), getAllTags()]);

  return {
    posts,
    tags,
  };
};
