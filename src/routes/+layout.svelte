<script lang="ts">
  let { children } = $props();
</script>

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

    <a class="rss-link" href="/rss.xml">RSS</a>
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

  .rss-link:hover {
    background: #1e293b;
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
