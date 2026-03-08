# blog-hobby 向け Copilot Instructions  

## ビルド・テスト・lint コマンド  

```bash  
pnpm install  

# アプリ実行  
pnpm dev  
pnpm build  
pnpm preview   # .svelte-kit/cloudflare/_worker.js を :4173 で起動  

# 型生成と型チェック  
pnpm gen  
pnpm check  
pnpm check:watch  

# Vitest（デフォルトは watch）  
pnpm test:unit  
pnpm test:unit -- --run  
pnpm test:unit -- --run src/lib/slug.spec.ts  
pnpm test:unit -- --run src/routes/page.svelte.spec.ts  

# Playwright  
pnpm test:e2e  
pnpm test:e2e e2e/demo.test.ts  

# 全体実行  
pnpm test  

# Markdown 用ツールは package.json の scripts には未定義  
npx textlint --fix src/lib/posts/**/*.md  
npx markdownlint-cli2 "**/*.md"  
```  

## 高レベルアーキテクチャ  

- このリポジトリは SvelteKit 2 + Svelte 5 のアプリで、  
  Cloudflare Workers にデプロイする前提です。`svelte.config.js` では  
  `@sveltejs/adapter-cloudflare` を使い、`wrangler.jsonc` では  
  `.svelte-kit/cloudflare/_worker.js` を実行対象にしています。  
- `mdsvex` が有効で、`.svx` もページ拡張子として登録されています。  
  そのため、Svelte のルート実装と Markdown 系コンテンツ実装の両方を  
  またいで確認する必要があります。  
- ブログコンテンツは現在 `src/lib/posts/*.md` にあります。  
  ファイル名がそのまま slug になるフラット構造で、frontmatter に  
  メタデータを持ちます。実行時の画像は `/assets/...` パスで  
  `static/assets/` から配信されます。  
- `src/lib/posts.ts` がサイト全体の共通データ層です。  
  `src/lib/posts/*.md` の生 Markdown を読み込み、frontmatter 解析、  
  HTML 化、タグ正規化を行い、記事一覧・記事詳細・タグページに  
  データを渡します。  
- ユーザー向けの主要ルートは次の 3 つです。  
  - `src/routes/+page.svelte`: 記事一覧と全タグ一覧  
  - `src/routes/articles/[slug]/+page.svelte`: 記事詳細ページ  
  - `src/routes/tags/[tag]/+page.svelte`: タグ別の記事一覧  
- `docs/agents/ブログ記事機能設計.md` と現行実装は一致しており、  
  Markdown は `src/lib/posts/`、画像は `static/assets/` を使います。  
- テストは `vite.config.ts` で実行環境ごとに分割されています。  
  - `client`: `@vitest/browser-playwright` を使うブラウザ実行の  
    Svelte コンポーネントテスト  
    （`src/**/*.svelte.{test,spec}.{js,ts}`）  
  - `server`: それ以外の `src/**/*.{test,spec}.{js,ts}` を対象にした  
    Node 実行のユニットテスト  
- `playwright.config.ts` の E2E は  
  `npm run build && npm run preview` で起動したアプリ  
  （ポート `4173`）に対して実行されます。E2E の失敗は  
  Svelte の build 失敗か、Worker preview 起動失敗のどちらでも  
  起こりえます。  

## 主要な規約  

- `AGENTS.md` にある AI ワークフローに従い、やりとりは日本語で行い、  
  作業要約は `docs/agents/`、設計・調査メモは  
  `docs/design/`、`docs/research/`、`docs/misc/` に保存します。  
- 機能追加は t-wada 式の TDD  
  （Red -> Green -> Refactor）に沿って進めます。  
  既存の設計メモも、まず純粋なデータ処理を固めてから  
  ルートや UI に進む前提で書かれています。  
- ドメインロジックやデータ処理ヘルパーは `src/lib/` に置き、  
  server 側 Vitest でテストします。Svelte コンポーネントのテストは  
  対象ファイルの近くに置き、browser project 側で実行します。  
- Vitest では `expect.requireAssertions` が有効なので、  
  すべてのテストで明示的な assertion が最低 1 つ必要です。  
- 共有コードや共有アセットの import には `$lib` を優先します。  
  既存レイアウトは Svelte 5 runes の `$props()` と  
  `{@render children()}` を使っているため、新規 Svelte コードも  
  その流儀に合わせてください。  
- `tsconfig.json` では TypeScript の strict mode に加え、  
  `allowJs` と `checkJs` も有効です。`.js` ファイルでも  
  緩い型付けに依存しないでください。  
- `src/lib/posts/*.md` を編集するときは、既存 frontmatter の形  
  （`title`、任意の `image`、`created`、`updated`、  
  任意の `published`、`tags`、`unlisted` 用のコメント付き  
  `flags` ブロック）を保ってください。  
