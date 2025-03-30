# ブックマークタグ管理拡張機能
Chrome拡張機能で、ブックマークにタグを付与して効率的に管理するためのツールです。

## 機能概要

- ブックマーク名に含まれる `@tag` 形式のテキストを自動的にタグとして認識
- 一つのブックマークに複数のタグを付与可能 (例: `Webサイト @tech @reference`)
- タグによるブックマークのフィルタリング表示
- タグ一覧の表示と管理

## 技術スタック

- WXT: Vue用の拡張機能開発フレームワーク
- Vue 3: UIコンポーネント構築
- Chrome Extension API: ブックマークの操作

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