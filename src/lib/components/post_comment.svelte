<script lang='ts'>
  import type { CommentConfig } from '$lib/types/post'

  import { toSnake } from '$lib/utils/case'

  interface Props {
    post: Urara.Post;
    config: CommentConfig;
  }

  let { post, config }: Props = $props();
  const comments = import.meta.glob<any>('/src/lib/components/comments/*.svelte', { eager: true, import: 'default' })
  let currentComment: string | undefined = $state()
  let currentConfig: undefined | unknown = $state()
  currentComment = localStorage.getItem('comment') ?? toSnake(config.use[0])
  // @ts-ignore No index signature with a parameter of type 'string' was found on type 'CommentConfig'. ts(7053)
  $effect(() => {
    if (currentComment)
      currentConfig = config[currentComment]
  });
</script>

{#if config?.use.length > 0}
  <div class='card card-body' id='post-comment'>
    {#if config.use.length > 1}
      <div
        class='tabs w-full mb-8'
        class:tab-bordered={config?.style === 'bordered'}
        class:tab-lifted={config?.style === 'lifted'}
        class:tabs-boxed={config?.style === 'boxed'}>
        {#each config.use as name}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <span
            class='flex-1 tab transition-all'
            class:tab-active={currentComment === toSnake(name)}
            onclick={() => {
              currentComment = toSnake(name)
              localStorage.setItem('comment', toSnake(name))
            }}>
            {name}
          </span>
        {/each}
      </div>
    {/if}
    {#if currentComment}
      {@const SvelteComponent = comments[`/src/lib/components/comments/${currentComment}.svelte`]}
      {#key currentComment}
        <SvelteComponent
          config={currentConfig}
          {post} />
      {/key}
    {/if}
  </div>
{/if}
