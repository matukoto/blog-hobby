import type { RequestHandler } from './$types';
import { getAllPosts } from '$lib/posts';

export const GET: RequestHandler = async ({ url }) => {
  const posts = await getAllPosts();

  const headers = {
    'Cache-Control': 'max-age=0, s-maxage=3600',
    'Content-Type': 'application/xml',
  };

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>blog hobby</title>
		<description>趣味のブログ</description>
		<link>${url.origin}</link>
		<atom:link href="${url.origin}/rss.xml" rel="self" type="application/rss+xml"/>
		${posts
      .map(
        (post) => `
		<item>
			<title>${post.title}</title>
			<description><![CDATA[${post.excerpt}]]></description>
			<link>${url.origin}/articles/${post.slug}</link>
			<guid isPermaLink="true">${url.origin}/articles/${post.slug}</guid>
			<pubDate>${new Date(post.created).toUTCString()}</pubDate>
		</item>`
      )
      .join('')}
	</channel>
</rss>`;

  return new Response(xml.trim(), { headers });
};
