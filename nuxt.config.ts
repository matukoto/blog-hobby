// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
  ],
  content: {
    highlight: {
      // コードハイライトのテーマ
      theme: 'github-dark-dimmed',
    },
  },
})
