<script lang='ts'>
  interface Props {
    nav: { children?: { link: string, text: string }[], link?: string, text: string }[];
    path: string;
    title: string;
    scrollY: number;
    pin: boolean;
  }

  let {
    nav,
    path,
    title,
    scrollY,
    pin
  }: Props = $props();
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- reference: https://github.com/saadeghi/daisyui/issues/1285 -->
<div class='dropdown lg:hidden'>
  <label class='btn btn-square btn-ghost' for='navbar-dropdown' tabindex='0'>
    <span class='i-heroicons-outline-menu-alt-1'></span>
  </label>
  <ul
    class='menu menu-compact dropdown-content bg-base-100 text-base-content shadow-lg rounded-box min-w-max max-w-52 p-2'
    class:hidden={!pin}
    id='navbar-dropdown'
    tabindex='0'>
    {#each nav as { children, link, text }}
      {#if link && !children}
        <li>
          <a class:font-bold={link === path} href={link}>{text}</a>
        </li>
      {:else if children}
        <li tabindex='0'>
          <span class='justify-between gap-1 max-w-[13rem]' class:font-bold={children.some(({ link }) => link === path)}>
            {text}
            <span class='i-heroicons-solid-chevron-right mr-2'></span>
          </span>
          <ul class='bg-base-100 text-base-content shadow-lg p-2'>
            {#each children as { link, text }}
              <li>
                <a class:font-bold={link === path} href={link}>{text}</a>
              </li>
            {/each}
          </ul>
        </li>
      {/if}
    {/each}
  </ul>
</div>
<div class='swap order-last hidden lg:inline-grid' class:swap-active={scrollY > 32 && title}>
  <button
    class='swap-on btn btn-ghost text-base font-normal normal-case transition-all duration-200'
    class:hidden={scrollY < 32 || !title}
    onclick={() => window.scrollTo(0, 0)}>
    {title}
  </button>
  <ul class='swap-off menu menu-horizontal p-0' class:hidden={scrollY > 64 && title}>
    {#each nav as { children, link, text }}
      {#if link && !children}
        <li>
          <a class='!rounded-btn' class:font-bold={link === path} href={link}>{text}</a>
        </li>
      {:else if children}
        <li>
          <span class='!rounded-btn gap-1' class:font-bold={children.some(({ link }) => link === path)}>
            {text}
            <span class='i-heroicons-solid-chevron-down -mr-1'></span>
          </span>
          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <ul class='menu rounded-box bg-base-100 text-base-content shadow-lg p-2' tabindex='0'>
            {#each children as { link, text }}
              <li>
                <a class:font-bold={link === path} href={link}>{text}</a>
              </li>
            {/each}
          </ul>
        </li>
      {/if}
    {/each}
  </ul>
</div>
