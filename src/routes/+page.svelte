<script lang="ts">
	import { formatDate } from '$lib/utils';
	import * as config from '$lib/config';

	import { GoogleAnalytics } from 'svelte-google-analytics';
	import { PUBLIC_MEASUREMENT_ID } from '$env/static/public';
	export let data;

	const measurementId = PUBLIC_MEASUREMENT_ID;
</script>

<svelte:head>
	<title>{config.title}</title>
	<GoogleAnalytics trackingId="${measurementId}" />
</svelte:head>

<!-- Post -->
<section>
	<ul class="posts">
		{#each data.posts as post}
			<li class="post">
				<a href={post.slug} class="title">
					{post.title}
				</a>
				<p class="date">{formatDate(post.date)}</p>
				<p class="description">{post.description}</p>
			</li>
		{/each}
	</ul>
</section>

<style>
	.posts {
		display: grid;
		gap: 2remq;
	}

	.post {
		max-inline-size: var(--size-content-3);
	}

	.post:not(:last-child) {
		border-bottom: 1px solid var(--border);
		padding-bottom: var(--size-7);
	}

	.title {
		font-size: var(--font-size-fluid-3);
	}

	.date {
		color: var(--text-2);
	}

	.description {
		margin-top: var(--size-3);
	}
</style>
