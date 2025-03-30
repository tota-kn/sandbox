# プロジェクト情報

## 機能概要
Chrome拡張機能で、ブックマークにタグを付与して効率的に管理するためのツールです。
- ブックマーク名に含まれる `@tag` 形式のテキストを自動的にタグとして認識
- 一つのブックマークに複数のタグを付与可能 (例: `Webサイト @tech @reference`)
- タグによるブックマークのフィルタリング表示
- タグ一覧の表示と管理

## 技術スタック

- WXT: Vue用の拡張機能開発フレームワーク
- Vue 3: UIコンポーネント構築
- Chrome Extension API: ブックマークの操作
- Tailwind: スタイル指定

## プロジェクト構成
WXTの標準に従う構造を採用しています。
参考：https://wxt.dev/guide/essentials/project-structure.html#project-structure

```
extention-bookmark-tag/
├─ entrypoints/         # 拡張機能のエントリーポイント
│  ├─ popup/            # ポップアップUI関連ファイル
│  ├─ options/          # オプション画面関連ファイル
│  └─ background/       # バックグラウンド処理のスクリプト
├─ components/          # 再利用可能なVueコンポーネント
│  └─ TagList.vue       # タグリスト表示コンポーネントなど
├─ composables/         # 共有可能なVue Composition API関数
│  └─ useBookmarkTags.ts # タグ操作のロジックなど
├─ assets/              # 画像などの静的ファイル
│  └─ icons/            # 拡張機能のアイコン
├─ utils/              # 汎用的な共通処理
├─ wxt.config.ts        # WXT設定ファイル
├─ package.json         # 依存関係定義
└─ README.md            # プロジェクト説明
```

## 開発環境セットアップ

```bash
# 依存パッケージのインストール
pnpm install

# 開発サーバーの起動
pnpm dev

# ビルド
pnpm build
```

# コーディングルール
- スタイル指定は必ずTailwindを利用し、インラインスタイル指定は利用しないでください。
- 指示された内容が、元のコードですでに実現されていた場合は変更を加えないでください
- コード中に極力コメントは書かず関数・変数・コンポーネントの定義命名とTSDocで説明してください
- 関数の返却型定義は必ず記載してください。返却がない場合はvoidを書いてください

## TSDoc

### 変数
変数定義をする際は、すべて一行で`/** ... */`で一行の説明を入れてください

### 関数
以下のタグを利用してください。

@param - 関数のパラメータに関する情報を提供します。
@returns - 関数の戻り値に関する情報を提供します。
@remarks - その他の注釈を提供します。
@example - コード例を提供します。
@see - 関連するドキュメントやリソースを参照します。
@deprecated - 使われていないものや非推奨のものを示します。
これらのタグは、関数やクラス、メソッド、プロパティなどのドキュメンテーションに使用されます。

以下は、@paramと@returnsの使用例です。
```ts
/**
 * 2つの数値を加算する。
 * @param {number} x - 加算する最初の数値。
 * @param {number} y - 加算する2つ目の数値。
 * @returns {number} 2つの数値の合計。
 */
function addNumbers(x: number, y: number): number {
  return x + y;
}
```
この例では、@paramタグが2つ使用されています。各タグには、パラメータの名前と説明が含まれています。@returnsタグには、戻り値の型と説明が含まれています。