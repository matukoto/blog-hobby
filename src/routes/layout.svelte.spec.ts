import { createRawSnippet } from 'svelte';
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Layout from './+layout.svelte';

describe('/+layout.svelte', () => {
	it('renders an RSS link in the site header', async () => {
		render(Layout, {
			children: createRawSnippet(() => ({
				render: () => '<div>child content</div>'
			}))
		});

		await expect.element(page.getByRole('link', { name: 'RSS' })).toHaveAttribute(
			'href',
			'/rss.xml'
		);
	});
});
