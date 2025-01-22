<script lang='ts'>
  
  interface Props {
    class?: string;
    in_reply_to: Urara.Post['in_reply_to'];
  }

  let { class: className = '', in_reply_to }: Props = $props();
</script>

<div class='flex flex-wrap gap-2 rounded-box outline outline-neutral/10 p-4{className}'>
  <span class='flex-none font-bold uppercase opacity-30'>Reply to:&nbsp;</span>
  <a
    class='ml-auto flex-none flex rounded-badge bg-base-200 hover:bg-base-300 transition-all gap-2 px-4 u-in-reply-to'
    href={in_reply_to}
    rel='noopener noreferrer external'
    target='_blank'>
    <span class='i-heroicons-outline-reply my-auto !w-4 !h-4'></span>
    {in_reply_to}
  </a>
</div>
