export type Categories = 'sveltekit' | 'svelte'

export interface Post {
  title: string
  slug: string
  description: string
  date: string
  categories: Categories[]
  published: boolean
}
