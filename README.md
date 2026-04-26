## about

My blog, base on [Urara](https://urara-demo.netlify.app/).

## code block metadata

ブログ記事の fenced code block では、先頭の info string でファイル名を指定できます。

1. `filename=` 形式

   ````md
   ```ts filename=main.ts
   const answer = 42;
   ```
   ````

2. `lang:filename` 形式

   ````md
   ```ts:main.ts
   const answer = 42;
   ```
   ````

表示ルール:

- ファイル名を指定した場合: `main.ts` のように**拡張子込みのファイル名**を1つのラベルで表示
- ファイル名を指定しない場合: `ts` のように**拡張子のみ**を表示（先頭の `.` は表示しない）

## Amazon link card

記事本文で Amazon リンクを単独行（段落）で書くと、ビルド時に取得した OGP メタデータを使ってカード表示します。

```md
[みんなのコンピュータサイエンス](https://amzn.to/41ReZTI)
```

仕様:

- 対象URL: `amzn.to` / `amzn.asia` / `amazon.*`
- **リンクだけの行（段落）のみ**カード化（文中リンクは通常リンク）
- ビルド時の取得に失敗したURLは通常リンクのまま表示（ビルドは継続）

## TODO

- [ ] Zenn の記事も一覧に表示
- [ ] 本一覧
  - [ ] 本の☆評価
  - [ ] 本の感想ページ
- [ ] 漫画一覧
  - [ ] 漫画の☆評価
  - [ ] 漫画の一言コメント
- [ ] tag
- [ ] 全文検索
  - [ ] migemo

## License

- Contents are under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
