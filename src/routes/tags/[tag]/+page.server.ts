import { error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

import { getAllTags, getPostsByTag } from '$lib/posts';

export const load: PageServerLoad = async ({ params }) => {
	const [tags, posts] = await Promise.all([
		getAllTags(),
		getPostsByTag(params.tag)
	]);
	const tag = tags.find((entry) => entry.slug === params.tag);

	if (!tag || posts.length === 0) {
		throw error(404, 'Not found');
	}

	return {
		tag,
		posts
	};
};
