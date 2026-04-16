<script lang="ts">
  import { afterNavigate } from '$app/navigation';

  type Props = {
    gaId?: string;
  };

  let { gaId }: Props = $props();

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
      data-ga-id={gaId}
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
      const script = document.currentScript;
      if (script instanceof HTMLScriptElement && script.dataset.gaId) {
        gtag('config', script.dataset.gaId);
      }
    </script>
  {/if}
</svelte:head>
