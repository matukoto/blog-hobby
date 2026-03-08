import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('renders the article list and tag links', async () => {
		render(Page, {
			data: {
				posts: [
					{
						slug: 'first',
						title: 'SvelteKit でブログを作ってみた',
						image: '/assets/svelte.png',
						created: '2024-09-20',
						updated: '2024-09-20',
						published: '2024-09-20',
						excerpt: 'SvelteKit でブログを作ってみた感想です。',
						tags: [
							{ name: 'svelte', slug: 'svelte' },
							{ name: 'tech', slug: 'tech' }
						],
						unlisted: false
					}
				],
				tags: [
					{ name: 'svelte', slug: 'svelte', count: 1 },
					{ name: 'tech', slug: 'tech', count: 1 }
				]
			}
		});

		await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('blog hobby');
		await expect.element(
			page.getByRole('link', { name: 'SvelteKit でブログを作ってみた' })
		).toHaveAttribute('href', '/articles/first');
		await expect
			.element(
				page.getByRole('complementary', { name: 'タグ' }).getByRole('link', { name: 'tech' })
			)
			.toHaveAttribute(
			'href',
			'/tags/tech'
			);
	});
});
