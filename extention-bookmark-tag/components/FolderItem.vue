<template>
  <li>
    <div
      class="border-b border-border flex items-center py-2 hover:bg-gray-50 rounded hover:text-primary cursor-pointer"
      @click="$emit('toggle-folder-expanded', folder)"
    >
      <!-- フォルダ選択チェックボックス -->
      <input
        type="checkbox"
        :checked="getAllBookmarksInFolder(folder, allBookmarks).some(b => b.selected && !b.isFolder)"
        :indeterminate.prop="
          getAllBookmarksInFolder(folder, allBookmarks).some(b => b.selected && !b.isFolder) &&
            !getAllBookmarksInFolder(folder, allBookmarks).filter(b => !b.isFolder).every(b => b.selected)
        "
        class="h-4 w-4 text-primary mr-2"
        @change="$emit('toggle-folder-selection', folder)"
      >

      <span class="font-medium flex items-center space-x-2">
        <FolderIcon class="size-4 text-muted" />
        <span>{{ folder.title }}</span>
      </span>
      <span class="ml-2 text-xs text-muted">
        ({{ getAllBookmarksInFolder(folder, allBookmarks).filter(b => !b.isFolder).length }})
      </span>

      <div
        class="ml-2 size-4"
      >
        <ChevronDownIcon v-if="folder.expanded" />
        <ChevronRightIcon v-else />
      </div>
    </div>

    <!-- 展開時の中身表示 -->
    <div
      v-if="folder.expanded"
      class="pl-6"
    >
      <!-- サブフォルダの再帰的表示 -->
      <FolderItem
        v-for="subFolder in folderChildren.filter(b => b.isFolder)"
        :key="subFolder.id"
        :folder="subFolder"
        :all-bookmarks="allBookmarks"
        @update-title="(id, newTitle) => $emit('update-title', id, newTitle)"
        @toggle-select="$emit('toggle-select', $event)"
        @toggle-folder-expanded="$emit('toggle-folder-expanded', $event)"
        @toggle-folder-selection="$emit('toggle-folder-selection', $event)"
      />

      <!-- ブックマークの表示 -->
      <BookmarkItem
        v-for="bookmark in folderChildren.filter(b => !b.isFolder)"
        :key="bookmark.id"
        class="border-b border-border"
        :bookmark="bookmark"
        :selectable="true"
        :selected="bookmark.selected || false"
        @update-title="(newTitle) => $emit('update-title', bookmark.id, newTitle)"
        @toggle-select="$emit('toggle-select', bookmark)"
      />
    </div>
  </li>
</template>

<script setup lang="ts">
import BookmarkItem from './BookmarkItem.vue'
import { ExtendedBookmark, getAllBookmarksInFolder } from '../utils/bookmarkUtils'
import { FolderIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'

/**
 * フォルダアイテムコンポーネントのプロパティ定義
 */
const props = defineProps<{
  /** 表示するフォルダ情報 */
  folder: ExtendedBookmark
  /** すべてのブックマーク配列 */
  allBookmarks: ExtendedBookmark[]
}>()

/**
 * 現在のフォルダの子要素（ブックマークとサブフォルダ）
 */
const folderChildren = computed(() => {
  return props.allBookmarks.filter(b => b.parentId === props.folder.id)
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
