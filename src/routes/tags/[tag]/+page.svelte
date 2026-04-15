<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>{data.tag.name}| matukoto blog</title>
</svelte:head>

<section class="tag-page">
  <p class="back-link">
    <a href="/">← 記事一覧へ戻る</a>
  </p>

  <header>
    <h1>{data.tag.name}</h1>
    <p>{data.tag.count}件の記事</p>
  </header>

  <div class="posts">
		{#each data.posts as post}
			<article class="post-card">
				<p class="post-date">{post.created}</p>
				<h2>
					<a href={`/articles/${post.slug}`}>{post.title}</a>
				</h2>
				<p class="post-excerpt">{post.excerpt}</p>
			</article>
		{/each}
	</div>
</section>

<style>
  .tag-page {
    display: grid;
    gap: 1.5rem;
  }

  .back-link,
  header p,
  .post-date,
  .post-excerpt {
    color: #475569;
  }

  .back-link a,
  h2 a {
    text-decoration: none;
  }

  .posts {
    display: grid;
    gap: 1rem;
  }

  .post-card {
    background: #fff;
    border-radius: 1rem;
    padding: 1.25rem;
    box-shadow: 0 10px 30px rgb(15 23 42 / 0.08);
  }

  h1,
  h2 {
    margin-bottom: 0.5rem;
  }
</style>
