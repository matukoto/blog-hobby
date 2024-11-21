import type { Post } from '$lib/types'
import { json } from '@sveltejs/kit'

async function getPosts() {
  let posts: Post[] = []

  const paths = import.meta.glob('/src/posts/article/*md', { eager: true })

  for (const path in paths) {
    const file = paths[path]
    // 拡張子はいらない
    const slug = `article/${path.split('/').at(-1)?.replace('.md', '')}`

    // ファイルがオブジェクトで、メタデータとスラッグを含んでいるかチェックする
    if (file && typeof file === 'object' && 'metadata' in file && slug) {
      // metadata タイトル、著者、公開日、タグなど を Post にキャスト
      const metadata = file.metadata as Omit<Post, 'slug'>
      const post = { ...metadata, slug } satisfies Post
      post.published && posts.push(post)
    }
  }

  // 日付順にソート
  posts = posts.sort((first, second) => {
    return new Date(second.date).getTime() - new Date(first.date).getTime()
  })

  return posts
}

export async function GET() {
  const posts = await getPosts()
  return json(posts)
}
