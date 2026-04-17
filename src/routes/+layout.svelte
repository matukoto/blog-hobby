<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import GoogleAnalytics from '$lib/GoogleAnalytics.svelte';
  import { siBluesky, siGithub } from 'simple-icons';

  let {
    children,
    data,
  }: {
    children: Snippet;
    data?: LayoutData;
  } = $props();
</script>

<GoogleAnalytics gaId={data?.gaId}/>

<svelte:head>
  <link rel="icon" href="/assets/favicon.ico">
  <link
    rel="alternate"
    type="application/rss+xml"
    title="matukoto blog"
    href="/rss.xml"
  >
</svelte:head>

<div class="app-shell">
  <header class="site-header">
    <div class="site-brand">
      <a class="site-title" href="/">matukoto blog</a>
      <p class="site-description">雑多ブログ</p>
    </div>

    <div class="site-actions">
      <nav class="header-social-links" aria-label="ソーシャルリンク">
        <a
          class="icon-link icon-link--github"
          href="https://github.com/matukoto"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="GitHub profile"
          title="GitHub"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={siGithub.path} fill="currentColor"/>
          </svg>
        </a>
        <a
          class="icon-link icon-link--bluesky"
          href="https://bsky.app/profile/matukoto"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="BlueSky profile"
          title="BlueSky"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={siBluesky.path} fill="currentColor"/>
          </svg>
        </a>
      </nav>

      <a class="rss-link" href="/rss.xml">RSS</a>
    </div>
  </header>

  <main class="site-main">{@render children()}</main>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family:
      Inter, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP",
      sans-serif;
    background: #f8fafc;
    color: #0f172a;
  }

  :global(a) {
    color: inherit;
  }

  .app-shell {
    min-height: 100vh;
  }

  .site-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 2rem 1.5rem 1rem;
    max-width: 72rem;
    margin: 0 auto;
  }

  .site-brand {
    min-width: 0;
  }

  .site-title {
    font-size: 1.75rem;
    font-weight: 700;
    text-decoration: none;
  }

  .site-description {
    margin: 0.5rem 0 0;
    color: #475569;
  }

  .site-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .rss-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    min-height: 2.5rem;
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    background: #0f172a;
    color: #fff;
    font-weight: 700;
    text-decoration: none;
  }

  .header-social-links {
    display: flex;
    gap: 0.5rem;
  }

  .icon-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    min-height: 2.5rem;
    padding: 0.75rem;
    border-radius: 9999px;
    background: #e2e8f0;
    text-decoration: none;
  }

  .icon-link svg {
    width: 1.25rem;
    height: 1.25rem;
    display: block;
  }

  .icon-link--github {
    color: #0f172a;
  }

  .icon-link--bluesky {
    color: #0285ff;
  }

  .icon-link:hover,
  .rss-link:hover {
    background: #cbd5e1;
  }

  .rss-link:hover {
    background: #1e293b;
    color: #fff;
  }

  .rss-link:focus-visible {
    outline: 2px solid #f59e0b;
    outline-offset: 2px;
  }

  .site-main {
    max-width: 72rem;
    margin: 0 auto;
    padding: 0 1.5rem 4rem;
  }

  @media (max-width: 640px) {
    .site-header {
      flex-direction: column;
    }
  }
</style>
