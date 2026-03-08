# AI エージェント設定  

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

## ビルド・テスト・チェックコマンド  

### 開発  

```bash  
pnpm dev     # 開発サーバー起動  
pnpm build   # 本番ビルド  
pnpm preview # Wrangler でプレビュー (ポート 4173)  
```  

### 型チェック  

```bash  
pnpm check       # TypeScript と Svelte の型チェック  
pnpm check:watch # watch モードで型チェック  
pnpm gen         # Wrangler types 生成  
```  

### テスト  

```bash  
# Unit テスト (Vitest)  
pnpm test:unit          # watch モード  
pnpm test:unit -- --run # 1回だけ実行  

# 単一ファイルのテスト  
pnpm test:unit src/demo.spec.ts               # server テスト  
pnpm test:unit src/routes/page.svelte.spec.ts # client (browser) テスト  

# E2E テスト (Playwright)  
pnpm test:e2e # E2E テスト実行  

# すべてのテスト  
pnpm test # unit + E2E  
$()$( ### Lint / Format  

)$()bash  
# Markdown lint (textlint)  
npx textlint --fix urara/**/*.md  

# Markdown format (markdownlint)  
npx markdownlint-cli2 "**/*.md"  
```  

## コードスタイルガイドライン  

### TypeScript 設定  

- **strict モード**: 有効  
- **allowJs / checkJs**: 有効（.js ファイルも型チェック対象）  
- **esModuleInterop**: 有効  
- **forceConsistentCasingInFileNames**: 有効（大文字小文字を厳密に）  
- **moduleResolution**: bundler  

### インポート  

```typescript  
// $lib エイリアスを使用  
import Component from '$lib/components/Component.svelte';  
import { helper } from '$lib/utils';  

// 相対パス（同一ディレクトリ内のみ）  
import Page from './+page.svelte';  
```  

### 命名規則  

- **ファイル名**:  
  - Svelte コンポーネント: `Component.svelte` (PascalCase)  
  - SvelteKit ルート: `+page.svelte`, `+layout.svelte`, `+server.ts`  
  - TypeScript: `kebab-case.ts` または `camelCase.ts`  
  - テストファイル: `*.spec.ts` または `*.test.ts`  
- **変数・関数**: camelCase  
- **型・インターフェース**: PascalCase  
- **定数**: UPPER_SNAKE_CASE または camelCase  

### Svelte 5 構文  

```svelte  
<script lang="ts">  
  // $props() を使用（Svelte 5 の runes API）  
  let { children, title = 'Default' } = $props();  

  // $state() でリアクティブな状態管理  
  let count = $state(0);  
</script>  

<!-- {@render children()} でスロット描画 -->  
{@render children()}  
```  

### 型定義  

```typescript  
// 明示的に型を指定  
const items: string[] = [];  

// 戻り値の型も記述（複雑な関数の場合）  
function calculate(x: number, y: number): number {  
  return x + y;  
}  

// 型推論に頼る場合も可（シンプルな場合）  
const sum = (a: number, b: number) => a + b;  
```  

### エラーハンドリング  

```typescript  
// SvelteKit のエラー関数を使用  
import { error } from '@sveltejs/kit';  

export async function load({ params }) {  
  const post = await getPost(params.slug);  
  if (!post) {  
    throw error(404, 'Post not found');  
  }  
  return { post };  
}  
```  

### テスト記述  

```typescript  
// Unit test (server)  
import { describe, it, expect } from 'vitest';  

describe('function name', () => {  
  it('should do something', () => {  
    expect(1 + 2).toBe(3);  
  });  
});  

// Component test (browser)  
import { page } from 'vitest/browser';  
import { describe, expect, it } from 'vitest';  
import { render } from 'vitest-browser-svelte';  
import Component from './Component.svelte';  

describe('Component', () => {  
  it('should render', async () => {  
    render(Component);  
    const heading = page.getByRole('heading', { level: 1 });  
    await expect.element(heading).toBeInTheDocument();  
  });  
});  

// E2E test (Playwright)  
import { expect, test } from '@playwright/test';  

test('page has expected content', async ({ page }) => {  
  await page.goto('/');  
  await expect(page.locator('h1')).toBeVisible();  
});  
```  

### フォーマット  

- **タブ**: タブ文字（tsconfig.json, package.json などで確認）  
- **セミコロン**: 使用する  
- **クォート**: シングルクォート推奨  
- **改行**: LF（Unix スタイル）  

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

## Available MCP Tools  

### 1. list-sections  

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.  
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.  

### 2. get-documentation  

Retrieves full documentation content for specific sections. Accepts single or multiple sections.  
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.  

### 3. svelte-autofixer  

Analyzes Svelte code and returns issues and suggestions.  
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.  

### 4. playground-link  

Generates a Svelte Playground link with the provided code.  
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.  
