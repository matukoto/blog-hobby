<script lang="ts">
  import { run } from 'svelte/legacy';

  import { browser, dev } from "$app/environment";
  import Head from "$lib/components/head_static.svelte";
  import Header from "$lib/components/header.svelte";
  import Transition from "$lib/components/transition.svelte";
  import { posts, tags } from "$lib/stores/posts";
  import { genTags } from "$lib/utils/posts";
  import { onMount } from "svelte";
  import "uno.css";

  import type { LayoutData } from "./$types";

  import "../app.pcss";

  interface Props {
    data: LayoutData;
    children?: import('svelte').Snippet;
  }

  let { data, children }: Props = $props();

  let { path, res } = $state(data);

  run(() => {
    if (data) path = data.path;
  });

  posts.set(res);
  tags.set(genTags(res));
  onMount(() => !dev && browser);
</script>

<Head />

<Header {path} />

<Transition {path}>
  {@render children?.()}
</Transition>
