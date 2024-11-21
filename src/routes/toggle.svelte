<script lang='ts'>
  import { theme, toggleTheme } from '$lib/theme'
  import { Moon, Sun } from 'lucide-svelte'
  import { fly } from 'svelte/transition'
</script>

<button on:click={toggleTheme} aria-label='Toggle theme'>
  {#if $theme === 'dark'}
    <div in:fly={{ y: 10 }}>
      <Sun />
      <span>Light</span>
    </div>
  {:else}
    <div in:fly={{ y: -10 }}>
      <Moon />
      <span>Dark</span>
    </div>
  {/if}
</button>

<style>
	button > * {
		display: flex;
		gap: var(--size-2);
	}
</style>
