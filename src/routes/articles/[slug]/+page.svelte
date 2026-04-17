<script lang="ts">
  import { getArticleOgpImageUrl } from '$lib/ogp';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  let shareStatus = $state('');
  const BLOG_NAME = 'matukoto blog';

  function getShareUrl() {
    return new URL(`/articles/${data.post.slug}`, data.origin).toString();
  }

  function getShareText(shareUrl: string) {
    return `${data.post.title} | ${BLOG_NAME}\n${shareUrl}`;
  }

  function isDesktopLike() {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: fine)').matches
    );
  }

  async function copyShareText(shareText: string) {
    if (typeof navigator === 'undefined' || !('clipboard' in navigator)) {
      shareStatus = 'この環境ではクリップボードにコピーできません。';
      return false;
    }

    await navigator.clipboard.writeText(shareText);
    shareStatus = '記事タイトルとブログ名を含むリンクをコピーしました。';
    return true;
  }

  async function handleShare() {
    const shareUrl = getShareUrl();
    const shareText = getShareText(shareUrl);
    if (isDesktopLike()) {
      await copyShareText(shareText);
      return;
    }

    const shareData = {
      title: `${data.post.title} | ${BLOG_NAME}`,
      text: shareText,
      url: shareUrl,
    };

    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share(shareData);
        shareStatus = '共有画面を開きました。';
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          shareStatus = '共有をキャンセルしました。';
          return;
        }
      }
    }

    await copyShareText(shareText);
  }
</script>

<svelte:head>
  <title>{data.post.title}| matukoto blog</title>
  <meta name="description" content={data.post.excerpt}>
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="matukoto blog">
  <meta property="og:title" content={`${data.post.title} | matukoto blog`}>
  <meta property="og:description" content={data.post.excerpt}>
  <meta property="og:url" content={`${data.origin}/articles/${data.post.slug}`}>
  <meta
    property="og:image"
    content={getArticleOgpImageUrl(data.origin, data.post.slug)}
  >
  <meta property="og:image:alt" content={data.post.title}>
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content={`${data.post.title} | matukoto blog`}>
  <meta name="twitter:description" content={data.post.excerpt}>
  <meta
    name="twitter:image"
    content={getArticleOgpImageUrl(data.origin, data.post.slug)}
  >
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
    <img class="article-image" src={data.post.image} alt="">
  {/if}

  <div class="article-content">{@html data.post.content}</div>

  <footer class="article-footer">
    <button type="button" class="share-button" onclick={handleShare}>
      share
    </button>
    <p class="share-status" aria-live="polite">{shareStatus}</p>
  </footer>
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

  .article-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem 1rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e2e8f0;
  }

  .share-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.5rem;
    padding: 0.5rem 1rem;
    border: 0;
    border-radius: 9999px;
    background: #0f172a;
    color: #fff;
    font: inherit;
    font-weight: 700;
  }

  .share-button:hover {
    background: #1e293b;
  }

  .share-button:focus-visible {
    outline: 2px solid #f59e0b;
    outline-offset: 2px;
  }

  .share-status {
    margin: 0;
    color: #475569;
  }
</style>
