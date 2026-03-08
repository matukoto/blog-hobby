# Copilot instructions for blog-hobby  

## Build, test, and lint commands  

```bash  
pnpm install  

# app lifecycle  
pnpm dev  
pnpm build  
pnpm preview   # Wrangler serves .svelte-kit/cloudflare/_worker.js on :4173  

# type generation and checking  
pnpm gen  
pnpm check  
pnpm check:watch  

# Vitest (watch by default)  
pnpm test:unit  
pnpm test:unit -- --run  
pnpm test:unit -- --run src/lib/slug.spec.ts  
pnpm test:unit -- --run src/routes/page.svelte.spec.ts  

# Playwright  
pnpm test:e2e  
pnpm test:e2e e2e/demo.test.ts  

# full suite  
pnpm test  

# markdown tools are invoked directly, not through package.json scripts  
npx textlint --fix src/lib/posts/**/*.md  
npx markdownlint-cli2 "**/*.md"  
```  

## High-level architecture  

- This repository is a SvelteKit 2 + Svelte 5 app deployed to Cloudflare  
  Workers. `svelte.config.js` uses `@sveltejs/adapter-cloudflare`, and  
  `wrangler.jsonc` points Worker preview/runtime to  
  `.svelte-kit/cloudflare/_worker.js`.  
- `mdsvex` is enabled and `.svx` is registered as a page extension, so content  
  work spans both Svelte routes and Markdown-style content.  
- Blog content currently lives under `src/lib/posts/*.md` in a flat structure  
  where the filename is the slug. Those files use frontmatter for metadata,  
  while runtime images are served from `static/assets/` via `/assets/...`  
  paths.  
- `src/lib/posts.ts` is the shared data layer for the site. It reads the raw  
  markdown content from `src/lib/posts/*.md`, parses frontmatter, renders  
  HTML,  
  normalizes tags, and feeds the homepage, article pages, and tag pages.  
- The main user-facing routes are now:  
  - `src/routes/+page.svelte`: article listing plus global tag listing  
  - `src/routes/articles/[slug]/+page.svelte`: article detail pages  
  - `src/routes/tags/[tag]/+page.svelte`: tag-filtered article listing  
- The design notes in `docs/agents/ブログ記事機能設計.md` now match the active  
  content layout: markdown in `src/lib/posts/` and blog images in  
  `static/assets/`.  
- Testing is deliberately split by runtime in `vite.config.ts`:  
  - `client`: browser-based Svelte component tests using  
    `@vitest/browser-playwright` for `src/**/*.svelte.{test,spec}.{js,ts}`  
  - `server`: Node-based unit tests for the rest of  
    `src/**/*.{test,spec}.{js,ts}`  
- `playwright.config.ts` runs E2E against a built app with  
  `npm run build && npm run preview` on port `4173`, so end-to-end failures  
  can come from either the Svelte build or the Worker preview step.  

## Key conventions  

- Follow the repository AI workflow from `AGENTS.md`: communicate in Japanese,  
  save work summaries under `docs/agents/`, and put design/research artifacts  
  under `docs/design/`, `docs/research/`, or `docs/misc/` as appropriate.  
- Follow the documented t-wada style TDD flow  
  (Red -> Green -> Refactor) when adding features. The existing design notes  
  for article pages also assume that  
  pure data-loading logic lands before route/UI work.  
- Keep domain/data helpers in `src/lib/` and test them with server-side Vitest  
  specs. Route component tests live next to the Svelte file and run in the  
  browser project.  
- `expect.requireAssertions` is enabled globally in Vitest, so every test  
  should make at least one explicit assertion.  
- Prefer `$lib` imports for shared code and assets. The existing layout uses  
  Svelte 5 runes (`$props()` and `{@render children()}`), so new Svelte code  
  should match that style instead of older slot APIs.  
- TypeScript is strict, and `allowJs` + `checkJs` are enabled in  
  `tsconfig.json`. Avoid loose typing even in `.js` files.  
- When editing `src/lib/posts/*.md`, preserve the established frontmatter  
  shape:  
  `title`, optional `image`, `created`, `updated`, optional `published`,  
  `tags`, and the commented `flags` block used for unlisted posts.  
