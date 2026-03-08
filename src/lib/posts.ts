import { marked } from 'marked';

import { normalizeSlug } from './slug';

type RawPostModule = Record<string, string>;

export type PostTag = {
	name: string;
	slug: string;
};

export type PostSummary = {
	slug: string;
	title: string;
	image?: string;
	created: string;
	updated: string;
	published?: string;
	excerpt: string;
	tags: PostTag[];
	unlisted: boolean;
};

export type Post = PostSummary & {
	content: string;
};

export type TagSummary = {
	name: string;
	slug: string;
	count: number;
};

type ParsedFrontmatter = {
	title: string;
	image?: string;
	created: string;
	updated: string;
	published?: string;
	tags: string[];
	unlisted: boolean;
};

type GetPostsOptions = {
	includeUnlisted?: boolean;
};

const RAW_POSTS = import.meta.glob('/urara/**/+page.md', {
	eager: true,
	import: 'default',
	query: '?raw'
}) as RawPostModule;

let postsPromise: Promise<Post[]> | undefined;

export async function getAllPosts(options: GetPostsOptions = {}): Promise<PostSummary[]> {
	const posts = await loadPosts();

	return filterPosts(posts, options).map(toPostSummary);
}

export async function getPost(slug: string): Promise<Post | null> {
	const posts = await loadPosts();

	return posts.find((post) => post.slug === slug) ?? null;
}

export async function getPostsByTag(
	tagSlug: string,
	options: GetPostsOptions = {}
): Promise<PostSummary[]> {
	const posts = await loadPosts();

	return filterPosts(posts, options)
		.filter((post) => post.tags.some((tag) => tag.slug === tagSlug))
		.map(toPostSummary);
}

export async function getAllTags(options: GetPostsOptions = {}): Promise<TagSummary[]> {
	const posts = filterPosts(await loadPosts(), options);
	const tagCounts = new Map<string, TagSummary>();

	for (const post of posts) {
		for (const tag of post.tags) {
			const existing = tagCounts.get(tag.slug);
			if (existing) {
				existing.count += 1;
				continue;
			}

			tagCounts.set(tag.slug, {
				name: tag.name,
				slug: tag.slug,
				count: 1
			});
		}
	}

	return [...tagCounts.values()].sort((left, right) =>
		left.name.localeCompare(right.name, 'ja')
	);
}

async function loadPosts(): Promise<Post[]> {
	postsPromise ??= Promise.all(
		Object.entries(RAW_POSTS).map(async ([path, source]) => {
			const slug = path.match(/\/urara\/([^/]+)\/\+page\.md$/)?.[1];
			if (!slug) {
				throw new Error(`Unexpected post path: ${path}`);
			}

			const { frontmatter, markdown } = splitFrontmatter(source);
			const metadata = parseFrontmatter(frontmatter);
			const content = await renderMarkdown(markdown, slug);

			return {
				slug,
				title: metadata.title,
				image: metadata.image,
				created: metadata.created,
				updated: metadata.updated,
				published: metadata.published,
				excerpt: createExcerpt(markdown),
				tags: metadata.tags.map(createTag),
				unlisted: metadata.unlisted,
				content
			} satisfies Post;
		})
	).then((posts) => posts.sort(comparePostsByDateDesc));

	return postsPromise;
}

function splitFrontmatter(source: string): { frontmatter: string; markdown: string } {
	const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);

	if (!match) {
		throw new Error('Post source is missing frontmatter');
	}

	return {
		frontmatter: match[1],
		markdown: match[2].trim()
	};
}

function parseFrontmatter(frontmatter: string): ParsedFrontmatter {
	const lines = frontmatter.split('\n');
	const metadata: Partial<ParsedFrontmatter> & { tags: string[]; unlisted: boolean } = {
		tags: [],
		unlisted: false
	};

	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index].trim();

		if (line.length === 0) {
			continue;
		}

		if (line.startsWith('#')) {
			if (line.includes('unlisted')) {
				metadata.unlisted = true;
			}

			continue;
		}

		const entry = line.match(/^([a-z]+):\s*(.*)$/i);
		if (!entry) {
			continue;
		}

		const [, key, rawValue] = entry;
		if (key === 'tags') {
			while (index + 1 < lines.length) {
				const nextLine = lines[index + 1].trim();
				const tagMatch = nextLine.match(/^-\s*(.*)$/);

				if (!tagMatch) {
					break;
				}

				metadata.tags.push(cleanScalar(tagMatch[1]));
				index += 1;
			}

			continue;
		}

		const value = cleanScalar(rawValue);

		if (key === 'image' && value.length === 0) {
			continue;
		}

		metadata[key as keyof ParsedFrontmatter] = value as never;
	}

	if (!metadata.title || !metadata.created || !metadata.updated) {
		throw new Error('Post frontmatter is missing required fields');
	}

	return metadata as ParsedFrontmatter;
}

function cleanScalar(value: string): string {
	return value.trim().replace(/^['"](.*)['"]$/, '$1').trim();
}

function createTag(name: string): PostTag {
	const cleanedName = name.trim();
	const slug = normalizeSlug(cleanedName) ?? cleanedName.toLowerCase();

	return {
		name: cleanedName,
		slug
	};
}

async function renderMarkdown(markdown: string, slug: string): Promise<string> {
	const rendered = await marked.parse(markdown, {
		async: true
	});

	return rendered.trim();
}

function createExcerpt(markdown: string): string {
	const line = markdown
		.split('\n')
		.map((entry) => entry.trim())
		.find((entry) => entry.length > 0 && !entry.startsWith('#') && !entry.startsWith('- '));

	if (!line) {
		return '';
	}

	return line
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/[*_`]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function comparePostsByDateDesc(left: Post, right: Post): number {
	return right.created.localeCompare(left.created);
}

function filterPosts(posts: Post[], options: GetPostsOptions): Post[] {
	return posts.filter((post) => options.includeUnlisted || !post.unlisted);
}

function toPostSummary(post: Post): PostSummary {
	return {
		slug: post.slug,
		title: post.title,
		image: post.image,
		created: post.created,
		updated: post.updated,
		published: post.published,
		excerpt: post.excerpt,
		tags: post.tags,
		unlisted: post.unlisted
	};
}
