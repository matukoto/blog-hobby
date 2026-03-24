<script lang="ts">
  import favicon from '$lib/assets/favicon.svg';
  import GoogleAnalytics from '$lib/GoogleAnalytics.svelte';

  let { children } = $props();
</script>

<GoogleAnalytics/>

<svelte:head>
  <link rel="icon" href={favicon}>
</svelte:head>

<div class="app-shell">
  <header class="site-header">
    <a class="site-title" href="/">blog hobby</a>
    <p class="site-description">趣味のブログ</p>
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
    padding: 2rem 1.5rem 1rem;
    max-width: 72rem;
    margin: 0 auto;
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

  .site-main {
    max-width: 72rem;
    margin: 0 auto;
    padding: 0 1.5rem 4rem;
  }
</style>
