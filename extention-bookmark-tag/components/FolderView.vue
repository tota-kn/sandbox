<template>
  <ul class="list-none p-0">
    <FolderItem
      v-for="child in rootItems"
      :key="child.id"
      :folder="child"
      :all-bookmarks="bookmarks"
      @update-title="(id, newTitle) => $emit('update-title', id, newTitle)"
      @toggle-select="$emit('toggle-select', $event)"
      @toggle-folder-expanded="$emit('toggle-folder-expanded', $event)"
      @toggle-folder-selection="$emit('toggle-folder-selection', $event)"
    />
  </ul>
</template>

<script setup lang="ts">
import FolderItem from './FolderItem.vue'
import { ExtendedBookmark } from '../utils/bookmarkUtils'
import { computed } from 'vue'

/**
 * フォルダビューコンポーネントのプロパティ定義
 */
const props = defineProps<{
  /** 表示するブックマーク配列 */
  bookmarks: ExtendedBookmark[]
}>()

/**
 * ルートフォルダ内のアイテム（ブックマークとサブフォルダ）
 * Vivaldiで重複表示されないように、最初に見つかったルートIDのみを使用
 */
const rootItems = computed(() => {
  // まず親IDがないか'0'のアイテムを探す（主要なルート）
  const mainRoot = props.bookmarks.find(b => !b.parentId || b.parentId === '0')

  if (mainRoot) {
    // 最初に見つかったルートIDを使用
    return props.bookmarks.filter(b => b.parentId === mainRoot.parentId)
  }

  // バックアップとして従来のロジック（ID '1'も含む）
  return props.bookmarks.filter(b =>
    !b.parentId || b.parentId === '0' || b.parentId === '1',
  )
})

/**
 * 親コンポーネントに通知するイベント
 */
defineEmits<{
  /** タイトル更新イベント */
  (e: 'update-title', id: string, newTitle: string): void
  /** ブックマーク選択状態変更イベント */
  (e: 'toggle-select', bookmark: ExtendedBookmark): void
  /** フォルダ展開状態変更イベント */
  (e: 'toggle-folder-expanded', folder: ExtendedBookmark): void
  /** フォルダ内ブックマークの一括選択状態変更イベント */
  (e: 'toggle-folder-selection', folder: ExtendedBookmark): void
}>()
</script>
