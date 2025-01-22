<script lang='ts'>
  interface Props {
    title: string | undefined;
    description: string | undefined;
    status: 'error' | 'info' | 'success' | 'warning' | undefined;
    children?: import('svelte').Snippet;
  }

  let {
    title,
    description,
    status,
    children
  }: Props = $props();
</script>

<div
  class='alert flex-col shadow-inner my-4'
  class:alert-error={status === 'error'}
  class:alert-info={status === 'info'}
  class:alert-success={status === 'success'}
  class:alert-warning={status === 'warning'}>
  <div class='mr-auto'>
    {#if status === 'success'}
      <span class='i-heroicons-outline-check-circle'></span>
    {:else if status === 'warning'}
      <span class='i-heroicons-outline-exclamation-circle'></span>
    {:else if status === 'error'}
      <span class='i-heroicons-outline-x-circle'></span>
    {:else}
      <span class='i-heroicons-outline-information-circle'></span>
    {/if}
    <div>
      <div class:font-bold={description}>{title}</div>
      {#if description}
        <div class='text-xs'>{description}</div>
      {/if}
    </div>
  </div>
  {#if children}
    <div class='block w-full'>
      {@render children?.()}
    </div>
  {/if}
</div>
