import { error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

import { getPost } from '$lib/posts';

export const load: PageServerLoad = async ({ params }) => {
  const post = await getPost(params.slug);

  if (!post) {
    throw error(404, 'Not found');
  }

  return { post };
};
