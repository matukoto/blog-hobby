<script module lang='ts'>
  import Image from '$lib/components/prose/img.svelte'
  import table from '$lib/components/prose/table.svelte'

  export { Image as img, table }
</script>

<script lang='ts'>
  import Container from '$lib/components/post_container.svelte'
  import { typeOfPost } from '$lib/utils/posts'
  
  
  
  interface Props {
    // auto-generated
    path: any;
    slug: any;
    toc: any;
    // common
    created: any;
    updated: any;
    published: any;
    summary: any;
    tags: any;
    flags: any;
    // specify
    title: any;
    image: any;
    in_reply_to: any;
    children?: import('svelte').Snippet;
  }

  let {
    path,
    slug,
    toc,
    created,
    updated,
    published,
    summary,
    tags,
    flags,
    title,
    image,
    in_reply_to,
    children
  }: Props = $props();
  // post
  const fm = { created, flags, image, in_reply_to, path, published, slug, summary, tags, title, toc, updated }
  const post = { type: typeOfPost(fm), ...fm }
</script>

<Container {post}>
  {@render children?.()}
</Container>
