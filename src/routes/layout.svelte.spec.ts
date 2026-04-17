import { createRawSnippet } from 'svelte';
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Layout from './+layout.svelte';

describe('/+layout.svelte', () => {
  it('renders the favicon link in the head', async () => {
    render(Layout, {
      children: createRawSnippet(() => ({
        render: () => '<div>child content</div>',
      })),
    });

    const iconHrefs = Array.from(
      document.querySelectorAll('link[rel="icon"]')
    ).map((link) => link.getAttribute('href'));

    expect(iconHrefs).toContain('/assets/favicon.ico');
  });

  it('renders an RSS link in the site header', async () => {
    render(Layout, {
      children: createRawSnippet(() => ({
        render: () => '<div>child content</div>',
      })),
    });

    await expect
      .element(page.getByRole('link', { name: 'RSS' }))
      .toHaveAttribute('href', '/rss.xml');
  });

  it('renders social links in the header and footer', async () => {
    render(Layout, {
      children: createRawSnippet(() => ({
        render: () => '<div>child content</div>',
      })),
    });

    await expect
      .element(
        page.getByRole('navigation', { name: 'ソーシャルリンク' }).getByRole('link', {
          name: 'GitHub profile',
        })
      )
      .toHaveAttribute('href', 'https://github.com/matukoto');
    await expect
      .element(
        page.getByRole('navigation', { name: 'ソーシャルリンク' }).getByRole('link', {
          name: 'BlueSky profile',
        })
      )
      .toHaveAttribute('href', 'https://bsky.app/profile/matukoto');
    await expect
      .element(page.getByRole('navigation', { name: '外部リンク' }).getByRole('link', {
        name: 'GitHub',
      }))
      .toHaveAttribute('href', 'https://github.com/matukoto');
    await expect
      .element(page.getByRole('navigation', { name: '外部リンク' }).getByRole('link', {
        name: 'BlueSky',
      }))
      .toHaveAttribute('href', 'https://bsky.app/profile/matukoto');
    expect(document.querySelector('footer .social-links svg')).toBeNull();
  });
});
