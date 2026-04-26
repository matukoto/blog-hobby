<script lang="ts">
  import { onMount } from 'svelte';
  import { getArticleOgpImageUrl } from '$lib/ogp';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  type ShareState = 'idle' | 'success' | 'error';
  const CODE_COPY_SELECTOR = '[data-code-copy]';
  const CODE_COPY_DEFAULT_LABEL = 'copy';
  const CODE_COPY_SUCCESS_LABEL = 'copied';
  const CODE_COPY_ERROR_LABEL = 'error';
  const CODE_COPY_RESET_DELAY_MS = 1500;

  let shareState = $state<ShareState>('idle');
  let articleContentElement = $state<HTMLElement | null>(null);
  const codeCopyResetTimers = new Map<HTMLButtonElement, number>();

  function getShareUrl() {
    return new URL(`/articles/${data.post.slug}`, data.origin).toString();
  }

  function getShareTitle() {
    return `${data.post.title}`;
  }

  function getDesktopClipboardText(shareUrl: string) {
    return `${getShareTitle()}\n${shareUrl}`;
  }

  function isDesktopLike() {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: fine)').matches
    );
  }

  function setShareSuccess() {
    shareState = 'success';
  }

  function setShareError() {
    shareState = 'error';
  }

  function resetShareState() {
    shareState = 'idle';
  }

  async function copyShareText(shareText: string) {
    if (typeof navigator === 'undefined' || !('clipboard' in navigator)) {
      setShareError();
      return false;
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setShareSuccess();
      return true;
    } catch {
      setShareError();
      return false;
    }
  }

  async function handleShare() {
    resetShareState();
    const shareUrl = getShareUrl();
    const shareTitle = getShareTitle();
    if (isDesktopLike()) {
      await copyShareText(getDesktopClipboardText(shareUrl));
      return;
    }

    const shareData = {
      title: shareTitle,
      text: getShareTitle(),
      url: shareUrl,
    };

    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share(shareData);
        setShareSuccess();
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      }
    }

    await copyShareText(getShareUrl());
  }

  function setCodeCopyButtonLabel(button: HTMLButtonElement, label: string) {
    button.textContent = label;
    button.setAttribute('aria-label', label);
  }

  function scheduleCodeCopyButtonReset(button: HTMLButtonElement) {
    const existingTimer = codeCopyResetTimers.get(button);
    if (existingTimer !== undefined) {
      window.clearTimeout(existingTimer);
    }

    const timer = window.setTimeout(() => {
      setCodeCopyButtonLabel(button, CODE_COPY_DEFAULT_LABEL);
      codeCopyResetTimers.delete(button);
    }, CODE_COPY_RESET_DELAY_MS);

    codeCopyResetTimers.set(button, timer);
  }

  function getCodeTextFromBlock(button: HTMLButtonElement): string | null {
    const container = button.closest('.code-block');
    if (!container) {
      return null;
    }

    const codeElement = container.querySelector('pre code');
    const codeText = codeElement?.textContent;
    return codeText ?? null;
  }

  async function copyCodeFromButton(button: HTMLButtonElement) {
    if (typeof navigator === 'undefined' || !('clipboard' in navigator)) {
      setCodeCopyButtonLabel(button, CODE_COPY_ERROR_LABEL);
      scheduleCodeCopyButtonReset(button);
      return;
    }

    const codeText = getCodeTextFromBlock(button);
    if (codeText === null) {
      setCodeCopyButtonLabel(button, CODE_COPY_ERROR_LABEL);
      scheduleCodeCopyButtonReset(button);
      return;
    }

    try {
      await navigator.clipboard.writeText(codeText);
      setCodeCopyButtonLabel(button, CODE_COPY_SUCCESS_LABEL);
    } catch {
      setCodeCopyButtonLabel(button, CODE_COPY_ERROR_LABEL);
    }

    scheduleCodeCopyButtonReset(button);
  }

  onMount(() => {
    if (!articleContentElement) {
      return;
    }

    const handleArticleContentClick = async (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const copyButton = target.closest(CODE_COPY_SELECTOR);
      if (!(copyButton instanceof HTMLButtonElement)) {
        return;
      }

      await copyCodeFromButton(copyButton);
    };

    articleContentElement.addEventListener('click', handleArticleContentClick);

    return () => {
      articleContentElement?.removeEventListener(
        'click',
        handleArticleContentClick
      );
      for (const timer of codeCopyResetTimers.values()) {
        window.clearTimeout(timer);
      }
      codeCopyResetTimers.clear();
    };
  });
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
  <p class="back-link"><a href="/">← 記事一覧へ戻る</a></p>

  <header class="article-header">
    <p class="article-date">{data.post.created}</p>
    <h1>{data.post.title}</h1>

    {#if data.post.tags.length > 0}
      <ul class="tag-list" aria-label={`${data.post.title} のタグ`}>
        {#each data.post.tags as tag}
          <li><a href={`/tags/${tag.slug}`}>{tag.name}</a></li>
        {/each}
      </ul>
    {/if}
  </header>

  {#if data.post.image}
    <img class="article-image" src={data.post.image} alt="">
  {/if}

  <div class="article-content" bind:this={articleContentElement}>
    {@html data.post.content}
  </div>

  <footer class="article-footer">
    <button
      type="button"
      class:share-button--success={shareState === 'success'}
      class="share-button"
      aria-label={shareState === 'success' ? 'シェア済み' : 'share'}
      onclick={handleShare}
    >
      {#if shareState === 'success'}
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M20 6.5 9 17.5l-5-5"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
          />
        </svg>
      {:else}
        share
      {/if}
    </button>
    {#if shareState === 'error'}
      <p class="share-status" aria-live="polite">エラー</p>
    {/if}
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

  .article-content :global(h1),
  .article-content :global(h2),
  .article-content :global(h3),
  .article-content :global(h4),
  .article-content :global(h5) {
    margin-top: 2rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.35rem;
    line-height: 1.3;
    border-bottom-width: 0.14rem;
    border-bottom-style: solid;
    border-bottom-color: transparent;
  }

  .article-content :global(h1) {
    border-bottom-color: #1d4ed8;
  }

  .article-content :global(h2) {
    border-bottom-style: double;
    border-bottom-color: #0f766e;
  }

  .article-content :global(h3) {
    border-bottom-style: dashed;
    border-bottom-color: #d97706;
  }

  .article-content :global(h4) {
    border-bottom-style: dotted;
    border-bottom-color: #7c3aed;
  }

  .article-content :global(h5) {
    border-bottom-style: groove;
    border-bottom-width: 0.2rem;
    border-bottom-color: #db2777;
  }

  .article-content :global(.amazon-link-card) {
    margin: 1.5rem 0;
  }

  .article-content :global(.amazon-link-card__link) {
    display: flex;
    gap: 0.9rem;
    align-items: stretch;
    text-decoration: none;
    color: #0f172a;
    border: 1px solid #cbd5e1;
    border-radius: 0.75rem;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 1px 2px rgb(15 23 42 / 0.08);
  }

  .article-content :global(.amazon-link-card__link:hover) {
    background: #f8fafc;
  }

  .article-content :global(.amazon-link-card__image) {
    width: 7rem;
    min-width: 7rem;
    object-fit: cover;
    background: #f1f5f9;
  }

  .article-content :global(.amazon-link-card__content) {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.75rem 0.9rem 0.85rem 0;
    min-width: 0;
  }

  .article-content :global(.amazon-link-card__badge) {
    width: fit-content;
    padding: 0.1rem 0.45rem;
    border-radius: 9999px;
    background: #ffedd5;
    color: #9a3412;
    font-size: 0.72rem;
    font-weight: 700;
  }

  .article-content :global(.amazon-link-card__title) {
    font-weight: 700;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }

  .article-content :global(.amazon-link-card__url) {
    color: #64748b;
    font-size: 0.78rem;
    line-height: 1.4;
  }

  .article-content :global(.code-block) {
    margin: 1.5rem 0;
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #cbd5e1;
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow:
      0 1px 2px rgb(15 23 42 / 0.08),
      inset 0 0 0 1px rgb(255 255 255 / 0.65);
  }

  .article-content :global(.code-block__header) {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    min-height: 2.25rem;
    padding: 0.35rem 0.75rem;
    border-bottom: 1px solid #cbd5e1;
    background: #f8fafc;
  }

  .article-content :global(.code-block__file) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 1.25rem;
    padding: 0 0.45rem;
    border-radius: 9999px;
    background: #e2e8f0;
    color: #334155;
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
      "Courier New", monospace;
    font-size: 0.76rem;
    font-weight: 700;
  }

  .article-content :global(.code-block__copy) {
    border: 1px solid #cbd5e1;
    border-radius: 0.45rem;
    background: #fff;
    color: #1e293b;
    font-size: 0.72rem;
    font-weight: 700;
    line-height: 1;
    text-transform: lowercase;
    padding: 0.35rem 0.45rem;
    cursor: pointer;
  }

  .article-content :global(.code-block__copy:hover) {
    background: #f1f5f9;
  }

  .article-content :global(.code-block__copy:focus-visible) {
    outline: 2px solid #f59e0b;
    outline-offset: 2px;
  }

  .article-content :global(pre) {
    margin: 0;
    width: 100%;
    box-sizing: border-box;
    padding: 1rem;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    overflow-x: visible;
  }

  .article-content :global(pre code) {
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
      "Courier New", monospace;
    font-size: 0.9rem;
    line-height: 1.7;
    white-space: normal;
    counter-reset: code-line;
  }

  .article-content :global(pre code .line) {
    display: block;
    position: relative;
    min-height: 1.7em;
    padding-left: 2.8rem;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .article-content :global(pre code .line::before) {
    position: absolute;
    left: 0;
    width: 2.2rem;
    text-align: right;
    color: #94a3b8;
    user-select: none;
    content: counter(code-line);
    counter-increment: code-line;
  }

  .article-content :global(:not(pre) > code) {
    padding: 0.1rem 0.35rem;
    border-radius: 0.375rem;
    background: #e2e8f0;
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

  .share-button svg {
    width: 1.25rem;
    height: 1.25rem;
    display: block;
  }

  .share-button--success {
    width: 2.75rem;
    padding: 0;
    background: #059669;
  }

  .share-button:hover {
    background: #1e293b;
  }

  .share-button--success:hover {
    background: #047857;
  }

  .share-button:focus-visible {
    outline: 2px solid #f59e0b;
    outline-offset: 2px;
  }

  .share-status {
    margin: 0;
    color: #b91c1c;
  }
</style>
