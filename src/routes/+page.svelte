<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>matukoto blog</title>
  <meta name="description" content="雑多ブログ。">
</svelte:head>

<section class="hero">
  <h1>matukoto blog</h1>
  <p>仕事、読書、映画、日常などなど</p>
</section>

<div class="content-grid">
  <section class="posts-section" aria-labelledby="posts-heading">
    <h2 id="posts-heading">記事一覧</h2>

    {#if data.posts.length === 0}
      <p>まだ公開中の記事はありません。</p>
    {:else}
      <div class="posts">
        {#each data.posts as post (post.slug)}
          <article class="post-card">
            <a
              class="post-link"
              href={`/articles/${post.slug}`}
              aria-label={post.title}
            ></a>

            {#if post.image}
              <img class="post-image" src={post.image} alt="">
            {/if}

            <div class="post-body">
              <p class="post-date">{post.created}</p>
              <h3>{post.title}</h3>
              <p class="post-excerpt">{post.excerpt}</p>

              {#if post.tags.length > 0}
                <ul class="tag-list" aria-label={`${post.title} のタグ`}>
                  {#each post.tags as tag (tag.slug)}
                    <li><a href={`/tags/${tag.slug}`}>{tag.name}</a></li>
                  {/each}
                </ul>
              {/if}
            </div>
          </article>
        {/each}
      </div>
    {/if}
  </section>

  <aside class="tags-section" aria-labelledby="tags-heading">
    <h2 id="tags-heading">タグ</h2>

    {#if data.tags.length === 0}
      <p>タグはまだありません。</p>
    {:else}
      <ul class="all-tags">
        {#each data.tags as tag (tag.slug)}
          <li>
            <a href={`/tags/${tag.slug}`}>{tag.name}</a>
            <span>{tag.count}</span>
          </li>
        {/each}
      </ul>
    {/if}
  </aside>
</div>

<style>
  .hero {
    padding: 2rem 0;
  }

  h1 {
    margin-bottom: 0.5rem;
    font-size: clamp(2.5rem, 6vw, 4rem);
  }

  .hero p,
  .post-excerpt,
  .post-date,
  .all-tags span {
    color: #475569;
  }

  .content-grid {
    display: grid;
    gap: 2rem;
  }

  .posts {
    display: grid;
    gap: 1.5rem;
  }

  .post-card,
  .tags-section {
    background: #fff;
    border-radius: 1rem;
    box-shadow: 0 10px 30px rgb(15 23 42 / 0.08);
    overflow: hidden;
  }

  .post-card {
    position: relative;
  }

  .post-link {
    position: absolute;
    inset: 0;
    z-index: 2;
    border-radius: inherit;
  }

  .post-image {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    position: relative;
    z-index: 1;
  }

  .post-body,
  .tags-section {
    padding: 1.25rem;
  }

  .post-body {
    position: relative;
    z-index: 1;
  }

  h2 {
    margin-top: 0;
  }

  h3 {
    margin: 0.25rem 0 0.75rem;
    font-size: 1.4rem;
  }

  .tag-list,
  .all-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    list-style: none;
    padding: 0;
    margin: 1rem 0 0;
  }

  .tag-list a,
  .all-tags a {
    display: inline-flex;
    align-items: center;
    padding: 0.35rem 0.75rem;
    border-radius: 9999px;
    background: #e2e8f0;
    text-decoration: none;
    position: relative;
    z-index: 3;
  }

  .post-link:focus-visible {
    box-shadow: inset 0 0 0 3px #2563eb;
  }

  .all-tags li {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  @media (min-width: 960px) {
    .content-grid {
      grid-template-columns: minmax(0, 2fr) minmax(18rem, 1fr);
      align-items: start;
    }
  }
</style>
