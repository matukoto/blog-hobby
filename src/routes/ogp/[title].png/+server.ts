import { generateOgpImage } from '$lib/generateOgpImage';
import type { RequestHandler } from '@sveltejs/kit';

export const prerender = true;

export const GET: RequestHandler = async ({ params }) => {
	const { title } = params;
	const png = await generateOgpImage(title);

	return new Response(png, {
		headers: {
			'Content-Type': 'image/png'
		}
	});
};
