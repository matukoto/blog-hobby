<script lang="ts">
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<div class='overflow-x-auto mb-4'>
  <table class='table w-full'>
    {@render children?.()}
  </table>
</div>
