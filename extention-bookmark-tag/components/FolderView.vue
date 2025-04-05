<template>
  <ul class="list-none p-0">
    <!-- ルートフォルダ内のアイテムを直接表示 -->
    <template
      v-for="child in rootItems"
      :key="child.id"
    >
      <!-- フォルダの場合 -->
      <li
        v-if="child.isFolder"
        class="mb-1"
      >
        <div class="flex items-center py-2 px-1 hover:bg-gray-50 rounded">
          <button 
            class="mr-2 w-4 h-4 flex items-center justify-center" 
            @click="toggleFolderExpanded(child)"
          >
            <span v-if="child.expanded">▼</span>
            <span v-else>▶</span>
          </button>
          
          <!-- フォルダ選択チェックボックス -->
          <div class="mr-2">
            <input 
              type="checkbox" 
              :checked="getAllBookmarksInFolder(child, bookmarks).some(b => b.selected && !b.isFolder)"
              :indeterminate.prop="
                getAllBookmarksInFolder(child, bookmarks).some(b => b.selected && !b.isFolder) && 
                  !getAllBookmarksInFolder(child, bookmarks).filter(b => !b.isFolder).every(b => b.selected)
              "
              class="h-4 w-4 text-primary"
              @change="toggleFolderSelection(child)"
            >
          </div>
          
          <span class="font-medium flex items-center space-x-2">
            <FolderIcon class="size-4 text-muted" />
            <span>{{ child.title }}</span>
          </span>
          <span class="ml-2 text-xs text-muted">
            ({{ getAllBookmarksInFolder(child, bookmarks).filter(b => !b.isFolder).length }})
          </span>
        </div>
        
        <!-- サブフォルダ内のアイテム -->
        <div
          v-if="child.expanded"
          class="pl-6"
        >
          <BookmarkItem 
            v-for="grandchild in bookmarks.filter(b => b.parentId === child.id && !b.isFolder)"
            :key="grandchild.id"
            :bookmark="grandchild"
            :selectable="true"
            :selected="grandchild.selected || false"
            @update-title="$emit('update-title', grandchild.id, $event)"
            @toggle-select="$emit('toggle-select', grandchild)"
          />
        </div>
      </li>
      
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
import { ExtendedBookmark, getAllBookmarksInFolder } from '../utils/bookmarkUtils'
import { FolderIcon } from '@heroicons/vue/24/outline'
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
const emit = defineEmits<{
  /** タイトル更新イベント */
  (e: 'update-title', id: string, newTitle: string): void
  /** ブックマーク選択状態変更イベント */
  (e: 'toggle-select', bookmark: ExtendedBookmark): void
  /** フォルダ展開状態変更イベント */
  (e: 'toggle-folder-expanded', folder: ExtendedBookmark): void
  /** フォルダ内ブックマークの一括選択状態変更イベント */
  (e: 'toggle-folder-selection', folder: ExtendedBookmark): void
}>()

/**
 * フォルダの展開状態を切り替える
 * @param {ExtendedBookmark} folder フォルダブックマーク
 * @returns {void}
 */
const toggleFolderExpanded = (folder: ExtendedBookmark): void => {
  emit('toggle-folder-expanded', folder)
}

/**
 * フォルダ内のブックマークの選択状態を切り替える
 * @param {ExtendedBookmark} folder フォルダブックマーク
 * @returns {void}
 */
const toggleFolderSelection = (folder: ExtendedBookmark): void => {
  emit('toggle-folder-selection', folder)
}
</script>