<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.post.title} | blog hobby</title>
	<meta name="description" content={data.post.excerpt} />
</svelte:head>

<article class="article">
	<p class="back-link">
		<a href="/">← 記事一覧へ戻る</a>
	</p>

	<header class="article-header">
    <p class="article-date">{data.post.created}</p>
		<h1>{data.post.title}</h1>

		{#if data.post.tags.length > 0}
			<ul class="tag-list" aria-label={`${data.post.title} のタグ`}>
				{#each data.post.tags as tag}
					<li>
						<a href={`/tags/${tag.slug}`}>{tag.name}</a>
					</li>
				{/each}
			</ul>
		{/if}
	</header>

	{#if data.post.image}
		<img class="article-image" src={data.post.image} alt="" />
	{/if}

	<div class="article-content">
		{@html data.post.content}
	</div>
</article>

<style>
	.article {
		background: #fff;
		border-radius: 1rem;
		padding: 1.5rem;
		box-shadow: 0 10px 30px rgb(15 23 42 / 0.08);
	}

	.back-link {
		margin-top: 0;
	}

	.back-link a,
	.tag-list a {
		text-decoration: none;
	}

	.article-header {
		margin-bottom: 1.5rem;
	}

	.article-date {
		margin-bottom: 0.5rem;
		color: #475569;
	}

	h1 {
		margin: 0 0 1rem;
		font-size: clamp(2rem, 5vw, 3rem);
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.tag-list a {
		display: inline-flex;
		padding: 0.35rem 0.75rem;
		border-radius: 9999px;
		background: #e2e8f0;
	}

	.article-image {
		width: 100%;
		max-height: 26rem;
		object-fit: cover;
		border-radius: 1rem;
		margin-bottom: 1.5rem;
	}

	.article-content :global(h2),
	.article-content :global(h3) {
		margin-top: 2rem;
	}

	.article-content :global(p),
	.article-content :global(li) {
		line-height: 1.8;
	}

	.article-content :global(ul),
	.article-content :global(ol) {
		padding-left: 1.5rem;
	}
</style>
