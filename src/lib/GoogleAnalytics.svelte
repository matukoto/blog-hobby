<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { env } from '$env/dynamic/public';

  const gaId = env.PUBLIC_GA_ID;

  afterNavigate(({ to }) => {
    if (typeof window !== 'undefined' && 'gtag' in window && to?.url && gaId) {
      // @ts-expect-error gtag is injected by Google Analytics
      window.gtag('config', gaId, {
        page_path: to.url.pathname,
      });
    }
  });
</script>

<svelte:head>
  {#if gaId}
    <script
      async
      src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
    ></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        // biome-ignore lint/complexity/noArguments: Google Analytics snippet needs arguments
        dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', '{gaId}');
    </script>
  {/if}
</svelte:head>
