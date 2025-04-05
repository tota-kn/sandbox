<template>
  <ul class="list-none p-0">
    <!-- ルートフォルダ内のアイテムを直接表示 -->
    <template
      v-for="child in rootItems"
      :key="child.id"
    >
      <!-- フォルダの場合 -->
      <FolderItem
        v-if="child.isFolder"
        :folder="child"
        :all-bookmarks="bookmarks"
        @update-title="(id, newTitle) => $emit('update-title', id, newTitle)"
        @toggle-select="$emit('toggle-select', $event)"
        @toggle-folder-expanded="$emit('toggle-folder-expanded', $event)"
        @toggle-folder-selection="$emit('toggle-folder-selection', $event)"
      />
      
      <!-- 通常のブックマークの場合 -->
      <BookmarkItem 
        v-else
        :bookmark="child"
        :selectable="true"
        :selected="child.selected || false"
        @update-title="$emit('update-title', child.id, $event)"
        @toggle-select="$emit('toggle-select', child)"
      />
    </template>
  </ul>
</template>

<script setup lang="ts">
import BookmarkItem from './BookmarkItem.vue'
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
 */
const rootItems = computed(() => {
  // ルートフォルダのIDは通常 '0' または '1'
  return props.bookmarks.filter(b => 
    b.parentId === '0' || b.parentId === '1'
  );
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