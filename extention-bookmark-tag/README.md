# ブックマークタグ管理拡張機能

Chrome拡張機能で、ブックマークにタグを付与して効率的に管理するためのツールです。

## 機能概要

- ブックマーク名に含まれる `@tag` 形式のテキストを自動的にタグとして認識
- 一つのブックマークに複数のタグを付与可能 (例: `Webサイト @tech @reference`)
- タグによるブックマークのフィルタリング表示
- タグ一覧の表示と管理

## 技術スタック

- **WXT**: Vue用の拡張機能開発フレームワーク
- **Vue 3**: UIコンポーネント構築
- **Chrome Extension API**: ブックマークの操作