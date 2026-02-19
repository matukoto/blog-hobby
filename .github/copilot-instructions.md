# Copilot Instructions for blog-hobby  

## 基本ルール  

- 日本語でやりとりすること  
- やりとりの要約（依頼内容、計画、実行内容、検証結果）を `docs/agents/` 以下に保存すること  
- 設計作業は `docs/design/`、調査は `docs/research/`、分類不能なものは `docs/misc/` に保存  

## プロジェクト概要  

- **フレームワーク**: SvelteKit (Svelte 5)  
- **言語**: TypeScript (strict モード)  
- **デプロイ**: Cloudflare Workers (adapter-cloudflare)  
- **パッケージマネージャー**: pnpm  
- **テスト**: Vitest (unit + component) / Playwright (E2E)  
- **コンテンツ**: MDSvex (Markdown + Svelte)  

## Build / Check / Test / Lint  

```bash  
# install  
pnpm install  

# dev / build / preview (Cloudflare Worker preview on :4173)  
pnpm dev  
pnpm build  
pnpm preview  

# type generation + type check  
pnpm gen  
pnpm check  
pnpm check:watch  

# unit + component tests (Vitest)  
pnpm test:unit  
pnpm test:unit -- --run # run a single test file  
pnpm test:unit -- --run src/lib/slug.spec.ts  
pnpm test:unit -- --run src/routes/page.svelte.spec.ts  

# E2E (Playwright)  
pnpm test:e2e  

# run a single E2E file  
pnpm test:e2e e2e/demo.test.ts  

# full test suite  
pnpm test  

# Markdown lint/format used in this repo  
npx textlint --fix urara/**/*.md  
npx markdownlint-cli2 "**/*.md"  
```  

## High-level architecture  

- This is a **SvelteKit + Svelte 5** app deployed to **Cloudflare Workers**  
  (`@sveltejs/adapter-cloudflare` in `svelte.config.js`, worker entry in  
  `wrangler.jsonc` as `.svelte-kit/cloudflare/_worker.js`).  
- Content is maintained as Markdown under `urara/**/+page.md` (Urara-style  
  content), with frontmatter fields such as `title`, `image`, `created`,  
  `updated`, `tags`, and images referenced from `static/assets` via  
  `/assets/...`.  
- The app currently has base routes in `src/routes/` (`+layout.svelte`,  
  `+page.svelte`) and an article detail route scaffold at  
  `src/routes/articles/[slug]/+page.svelte`; content-loading logic is intended  
  to live in `src/lib/` (`posts.ts` currently placeholder).  
- `mdsvex` preprocessing is enabled, and `.svx` is registered as a SvelteKit  
  page extension (`svelte.config.js`).  
- Testing is intentionally split by runtime in `vite.config.ts`:  
  - **client project**: browser-based Svelte component tests  
    (`src/**/*.svelte.{test,spec}.{js,ts}`) using  
    `@vitest/browser-playwright`  
  - **server project**: Node-based unit tests  
    (`src/**/*.{test,spec}.{js,ts}` excluding Svelte component tests)  
  - `expect.requireAssertions` is enabled globally.  
- E2E (`playwright.config.ts`) runs against a built app via  
  `npm run build && npm run preview` on port `4173`.  

## Key conventions in this repository  

- Follow the existing **TDD workflow (Red → Green → Refactor)** documented in  
  `AGENTS.md`.  
- Keep pure domain/data logic in `src/lib/` and test it with server-side  
  Vitest specs (example: `src/lib/slug.ts` + `src/lib/slug.spec.ts`).  
- Prefer `$lib` alias imports for shared code/assets; use relative imports  
  mainly within the same directory.  
- Use Svelte 5 runes patterns already present in the codebase (`$props()`,  
  `{@render children()}`).  
- TypeScript is strict and also checks `.js` files (`allowJs: true`,  
  `checkJs: true` in `tsconfig.json`); avoid adding code that relies on loose  
  typing.  

## テストディレクトリ構成  

```  
src/  
  ├── demo.spec.ts              # Server テスト (Vitest node environment)  
  ├── routes/  
  │   └── page.svelte.spec.ts   # Component テスト (Vitest browser)  
e2e/  
  └── demo.test.ts              # E2E テスト (Playwright)  
```  

## 重要なファイルパス  

- **SvelteKit 設定**: `svelte.config.js`  
- **Vite 設定**: `vite.config.ts`  
- **TypeScript 設定**: `tsconfig.json`  
- **Cloudflare Workers 設定**: `wrangler.jsonc`  
- **E2E テスト設定**: `playwright.config.ts`  
- **Markdown lint**: `.textlintrc.json`, `.markdownlint-cli2.jsonc`  

## 開発手法  

### TDD (テスト駆動開発)  

このプロジェクトでは **t-wada 式 TDD** で開発を進める。  

#### TDD の基本サイクル  

1. **Red**: まず失敗するテストを書く  
2. **Green**: テストが通る最小限のコードを書く  
3. **Refactor**: コードを整理・改善する  

#### 実践ルール  

- 新機能追加時は必ずテストから書き始める  
- テストが通らない状態で実装コードを書かない  
- リファクタリング時もテストが通ることを確認しながら進める  
- テストコードも本番コードと同等に丁寧に書く  

#### テストの粒度  

- **Unit テスト**: 関数・モジュール単位の振る舞いをテスト  
- **Component テスト**: Svelte コンポーネントの描画・インタラクションをテスト  
- **E2E テスト**: ユーザーの実際の操作フローをテスト  

## その他のベストプラクティス  

- コミット前に `pnpm check` と `pnpm test` を実行  
- Markdown ファイルは textlint で自動フォーマット  
- Cloudflare Workers 用の型定義は `wrangler types` で生成  
- 実装前にテストを書く（TDD の原則を守る）  
