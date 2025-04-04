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

## 一般ルール
- スタイル指定は必ずTailwindを利用し、インラインスタイル（style属性）は使用しないこと
- コメントは最小限に抑え、代わりに自己説明的な命名とTSDocを活用すること
- 汎用的な処理は `utils/` ディレクトリ内の適切なファイルに記載すること
- 指示された内容がすでに実装されていた場合、詳しい指示を確認してください

## TypeScript関連ルール

### 関数設計ルール
- すべての関数に返却型定義を明示すること（返却値がない場合は `void` と記載）
- 1つの関数は1つの責務を持つこと
- 関数は副作用を最小限に抑え、テストしやすい設計とすること
- 入力パラメータに基づいて出力を返す純粋関数を優先すること
- 複雑なロジックは小さな関数に分割すること
- 条件分岐が多い場合は、早期リターンパターンを検討すること
- TypeScript関数はテスト可能な単位で分割すること

### 汎用処理のutilsへの配置
- プロジェクト固有のロジックではない汎用的な関数は `utils/` に配置すること
- 関連する機能ごとにファイルを分割すること (例: `date-utils.ts`, `string-utils.ts`)
- utilsの関数は再利用性を重視し、依存関係を最小限にすること
- すべてのutilsの関数は単体テスト可能な設計とすること

### TSDoc 記述ルール

#### 変数のドキュメント
すべての変数定義には一行のドキュメントコメントを付けること
```ts
/** ユーザーの年齢を保持する変数 */
const userAge: number = 25;
```

#### 関数のドキュメント
関数には以下のTSDocタグを適切に使用すること

- `@param` - 関数のパラメータの説明
- `@returns` - 関数の戻り値の説明

##### 例
```ts
/**
 * 2つの数値を加算する
 * @param x 加算する最初の数値
 * @param y 加算する2つ目の数値
 * @returns 2つの数値の合計
 */
function addNumbers(x: number, y: number): number {
  return x + y;
}
```

## Vue関連ルール

### コンポーネント設計ルール
- 1つのコンポーネントは1つの責務に集中させること
- 表示が300行を超える場合は、適切に複数のコンポーネントに分割すること
- ロジックと表示を分離し、再利用可能な小さなコンポーネントを心がけること
- 複雑なロジックはcomposablesに切り出すこと

### Emitの型定義
コンポーネントのイベントemitには必ず型定義を行うこと

#### 例
```ts
const emit = defineEmits<{
  change: [id: number]
}>()
```

### スタイリング
- tailwindのCSSクラスを利用してください。styleタグとinline styleは使わないでください。
- クラス指定はなるべく/assets/css/tailwind.cssの定義にある変数を利用してください
