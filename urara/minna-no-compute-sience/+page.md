---
title: '感想「みんなのコンピュータサイエンス」'
image: '/assets/techbook.png'
created: 2024-12-26
updated: 2024-12-26
tags:
  - 'techbook'
# flags: // custom flags
#   - unlisted // hide article on the home page
---

[みんなのコンピュータサイエンス](https://amzn.to/41ReZTI) の感想記事です。  

## 全体の感想  

読んで良かった。200ページという少ない文量なので、サクッとコンピュータサイエンス(以下: CS)の概観をつかむことができる。自分はCSを専攻したことがなかったので、とても勉強になったし、今まで身につけた知識が整理された。  
具体的には以下のような人にオススメ。  

- これからアルゴリズムについて勉強していこうと思っている人  
- 基本情報技術者を取得したい人  
- 基本情報技術者を取得したが、知識が体系化されていないと感じている人  

## 本書の構成  

1章：基礎  
2章：効率  
3章：戦略  
4章：データ  
5章：アルゴリズム  
6章：データベース  
7章：コンピュータ  
8章：プログラミング  
9章：おわりに  

## お気に入りの箇所  

ちまたでは「アルゴリズムとデータ構造」という書籍やフレーズをよく見ますが、なぜこの2つがセットで語られるのかピンときていませんでした。  
しかし以下のフレーズを読んで腹落ちしました。  

```  
ほとんどのアルゴリズムは特定のデータ構造の対象でしか動作しません。  
事前にアルゴリズムを選択すれば対象をアルゴリズムに応じたデータ構造にするとこができます。  
```  

言われてみればそりゃそうなんですが。  
このフレーズを読むまでは  

1. データ構造がある  
2. それに適したアルゴリズムを使う  

というアプローチしか考えていませんでした。  
しかし、アルゴリズム->データ構造というアプローチもあるんだなと。  
このアプローチでLeetCodeの問題を解いていくと色々発見がありそうだなと思いました。  
※ LeetCode は問題で型が指定されているので、そこまで影響ないかもですが。  

## その他良かった点  

#### 4章：データ  

言語によらないデータ構造やそれに対する処理の名前(例：stackに対するpush,listに対するsliceなど)を知ることができます。  
例えば Go 言語の slice などもこの前提知識があればスッと理解できるはず。  

#### 6章：データベース  

RDB 以外にも NoSQL,地理情報DB などのデータベースについても触れられている。  

#### 7章：コンピュータ  

CPU,メモリ、ストレージなどの知識。自作PCを組んだときにL2キャッシュとか謎フレーズが出てきて、「どうせ多ければ多いだけ良いんだろ」と雑に考えていたが、理解。  

## 最後に  

良い本でした。  
物理本で買ったので後輩や駆け出しエンジニアに貸したい。  
半年後とかにもう一度読み返したい。  