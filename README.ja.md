# Jev AITuber Tension Demo

[English](./README.md) | 日本語

視聴者のコメントを [Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev) に渡し、AITuber のテンションが上がるか、変わらないか、下がるかを判定させるデモです。判定結果に応じて、テンションの数値と顔文字が変わります。

Jev は文章を生成しません。用意した選択肢のどれに当たるかを、選択肢ごとの確率つきで返します。このデモでは `UP` / `SAME` / `DOWN` の3つの確率をすべて画面に表示します。

```text
視聴者コメント → Jev → UP / SAME / DOWN → テンション変化 → 顔文字変化
```

## 起動

Node.js 20.19 以上、または 22.12 以上が必要です。

```bash
npm install
npm run dev
```

表示された URL をブラウザで開きます。

## 使い方

1. 画面の `SETTINGS` を開き、[OpenRouter](https://openrouter.ai/) の API キーを入力して `SAVE` を押します。
2. `Model ID` は `typesafe/jev-1.13` のままで動きます。
3. コメントを入力して `SEND` を押します(Enter キーでも送信できます)。

判定が返ると、`JEV DECISION` の3つの確率が更新され、最も確率の高い判定でテンションが変わります。

| 判定 | テンション |
| --- | --- |
| UP | +15 |
| SAME | 変化なし |
| DOWN | -15 |

テンションは 0 から 100 の範囲で、初期値は 50 です。顔文字は次のように変わります。

| テンション | 顔文字 |
| --- | --- |
| 80〜100 | `＼(^o^)／` |
| 60〜79 | `(｀・ω・´)` |
| 40〜59 | `(・ω・)` |
| 20〜39 | `(´・ω・`)` |
| 0〜19 | `(；ω；)` |

直近5件の判定は画面下部に表示します。ページを再読み込みすると、履歴とテンションは初期状態に戻ります。

## Jev の呼び出し

OpenRouter では、Jev を Chat Completions API から呼び出せません。このデモでは Decisions API(alpha)を使います。

```text
POST https://openrouter.ai/api/alpha/decisions
```

リクエストには、判定の材料になる `state` と、型を指定した質問 `questions` を入れます。プロンプト文は組み立てません。

```json
{
  "model": "typesafe/jev-1.13",
  "state": {
    "current_tension": 50,
    "viewer_comment": "今日かわいいね！"
  },
  "questions": {
    "tension": {
      "type": "choice",
      "instructions": "...",
      "criteria": { "up": "...", "same": "...", "down": "..." }
    }
  }
}
```

レスポンスの `answers.tension.probabilities` に、選択肢ごとの確率が入っています。

```json
{
  "answers": {
    "tension": {
      "type": "choice",
      "choice": "up",
      "confidence": 0.88,
      "probabilities": { "up": 0.91, "same": 0.07, "down": 0.02 }
    }
  }
}
```

アプリ内では、これを次の形に変換して扱います。

```ts
type JevDecision = { up: number; same: number; down: number }
```

`probabilities` は API の仕様上、省略されることがあります。その場合は `choice` の選択肢を 1、残りを 0 として扱います。どちらも読み取れないときはエラーとし、テンションは変更しません。

OpenRouter との通信は `src/lib/jev.ts` にまとめてあります。UI 側は `judgeTension()` と `JevDecision` だけを使うので、接続先を Jev の API に変える場合はこのファイルを差し替えます。

## API キーの扱い

API キーはブラウザの localStorage に保存し、ブラウザから OpenRouter へ直接送信します。ソースコードやリポジトリにはキーを書きません。

この方式は、手元で動かすデモのためのものです。公開する Web サービスで同じ方式を使うと、利用者のブラウザにキーが渡ってしまいます。公開する場合は、サーバー側でキーを保持し、サーバー経由で API を呼び出してください。

## このデモに含まれないもの

コメントへの返答文の生成、音声合成、音声認識、Live2D、YouTube や Twitch との接続、会話履歴、長期記憶は実装していません。

## 開発

```bash
npm run lint
npm run build
```

Vite、React、TypeScript で作っています。UI ライブラリと状態管理ライブラリは使っていません。

## ライセンス

[MIT](./LICENSE)
