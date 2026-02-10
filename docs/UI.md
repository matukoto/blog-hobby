# 画面  

## 記事一覧ページ  

## 記事ページ  

## 共通レイアウト（ヘッダー、フッター）  

```  
src/  
  ├── lib/  
  │    └── posts/ ( .md を入れる)  
  └── routes/  
       ├── +page.svelte (一覧を表示)  
       ├── [slug]/  
       │    └── +page.svelte (記事を表示)  
       └── api/  
            └── posts/  
                 └── +server.ts (全記事のメタデータを返す)  
``````  
