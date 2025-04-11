# プロジェクト情報

## プロジェクト概要
<未記載>

## 技術スタック

- pnpm: パッケージマネージャ
- WXT: Vue用の拡張機能開発フレームワーク
- Vue 3: UIコンポーネント構築
- Chrome Extension API: ブックマークの操作
- Tailwind: スタイル指定

## ディレクトリ構成
[WXTの標準に従う](https://wxt.dev/guide/essentials/project-structure.html#project-structure)ディレクトリ構成を採用しています。

```
extention-bookmark-tag/
├─ entrypoints/         # 拡張機能のエントリーポイント
│  ├─ popup/            # ポップアップUI関連ファイル
│  ├─ options/          # オプション画面関連ファイル
│  └─ background.ts       # バックグラウンド処理のスクリプト
│  └─ content.ts       # コンテンツ処理のスクリプト
├─ components/          # 再利用可能なVueコンポーネント
├─ composables/         # 共有可能なVue Composition API関数
├─ assets/              # 画像などの静的ファイル
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
