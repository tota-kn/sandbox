<template>
  <ul class="list-none p-0">
    <template
      v-for="bookmark in bookmarks"
      :key="bookmark.id"
    >
      <!-- ルートフォルダのみここで表示（重複表示を防ぐ） -->
      <li
        v-if="bookmark.isFolder && (!bookmark.parentId || bookmark.parentId === '0' || bookmark.parentId === '1') && 
          !bookmarks.some(b => b.id === bookmark.parentId && b.isFolder)"
        class="mb-1"
      >
        <div class="flex items-center py-2 px-1 hover:bg-gray-50 rounded">
          <button 
            class="mr-2 w-4 h-4 flex items-center justify-center" 
            @click="toggleFolderExpanded(bookmark)"
          >
            <span v-if="bookmark.expanded">▼</span>
            <span v-else>▶</span>
          </button>
          
          <!-- フォルダ選択チェックボックス -->
          <div class="mr-2">
            <input 
              type="checkbox" 
              :checked="getAllBookmarksInFolder(bookmark, bookmarks).some(b => b.selected && !b.isFolder)"
              :indeterminate.prop="
                getAllBookmarksInFolder(bookmark, bookmarks).some(b => b.selected && !b.isFolder) && 
                  !getAllBookmarksInFolder(bookmark, bookmarks).filter(b => !b.isFolder).every(b => b.selected)
              "
              class="h-4 w-4 text-primary"
              @change="toggleFolderSelection(bookmark)"
            >
          </div>
          
          <span class="font-medium flex items-center space-x-2">
            <FolderIcon class="size-4 text-muted" />            
            <span>{{ bookmark.title }}</span>
          </span>
          <span class="ml-2 text-xs text-muted">
            ({{ getAllBookmarksInFolder(bookmark, bookmarks).filter(b => !b.isFolder).length }})
          </span>
        </div>
        
        <!-- フォルダ内のブックマーク -->
        <div
          v-if="bookmark.expanded"
          class="pl-6"
        >
          <ul class="list-none p-0">
            <template
              v-for="child in bookmarks.filter(b => b.parentId === bookmark.id)"
              :key="child.id"
            >
              <!-- サブフォルダの場合 -->
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
                
                <!-- サブフォルダ内のアイテム（再帰的に表示） -->
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
        </div>
      </li>
    </template>
  </ul>
</template>

<script setup lang="ts">
import BookmarkItem from './BookmarkItem.vue'
import { ExtendedBookmark, getAllBookmarksInFolder } from '../utils/bookmarkUtils'
import { FolderIcon } from '@heroicons/vue/24/outline'

/**
 * フォルダビューコンポーネントのプロパティ定義
 */
defineProps<{
  /** 表示するブックマーク配列 */
  bookmarks: ExtendedBookmark[]
}>()

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