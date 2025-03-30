<template>
  <ul class="list-none p-0">
    <template v-for="bookmark in bookmarks" :key="bookmark.id">
      <!-- ルートフォルダのみここで表示（重複表示を防ぐ） -->
      <li v-if="bookmark.isFolder && (!bookmark.parentId || bookmark.parentId === '0' || bookmark.parentId === '1') && 
              !bookmarks.some(b => b.id === bookmark.parentId && b.isFolder)" class="mb-1">
        <div class="flex items-center py-2 px-1 hover:bg-gray-50 rounded">
          <button 
            @click="toggleFolderExpanded(bookmark)" 
            class="mr-2 w-4 h-4 flex items-center justify-center"
          >
            <span v-if="bookmark.expanded">▼</span>
            <span v-else>▶</span>
          </button>
          
          <!-- フォルダ選択チェックボックス -->
          <div class="mr-2">
            <input 
              type="checkbox" 
              :checked="getAllBookmarksInFolder(bookmark, bookmarks).some(b => b.selected && !b.isFolder)"
              @change="toggleFolderSelection(bookmark)"
              :indeterminate.prop="
                getAllBookmarksInFolder(bookmark, bookmarks).some(b => b.selected && !b.isFolder) && 
                !getAllBookmarksInFolder(bookmark, bookmarks).filter(b => !b.isFolder).every(b => b.selected)
              "
              class="h-4 w-4 text-blue-600"
            />
          </div>
          
          <span class="font-medium">
            📁 {{ bookmark.title }}
          </span>
          <span class="ml-2 text-xs text-gray-500">
            ({{ getAllBookmarksInFolder(bookmark, bookmarks).filter(b => !b.isFolder).length }})
          </span>
        </div>
        
        <!-- フォルダ内のブックマーク -->
        <div v-if="bookmark.expanded" class="pl-6">
          <ul class="list-none p-0">
            <template v-for="child in bookmarks.filter(b => b.parentId === bookmark.id)" :key="child.id">
              <!-- サブフォルダの場合 -->
              <li v-if="child.isFolder" class="mb-1">
                <div class="flex items-center py-2 px-1 hover:bg-gray-50 rounded">
                  <button 
                    @click="toggleFolderExpanded(child)" 
                    class="mr-2 w-4 h-4 flex items-center justify-center"
                  >
                    <span v-if="child.expanded">▼</span>
                    <span v-else>▶</span>
                  </button>
                  
                  <!-- フォルダ選択チェックボックス -->
                  <div class="mr-2">
                    <input 
                      type="checkbox" 
                      :checked="getAllBookmarksInFolder(child, bookmarks).some(b => b.selected && !b.isFolder)"
                      @change="toggleFolderSelection(child)"
                      :indeterminate.prop="
                        getAllBookmarksInFolder(child, bookmarks).some(b => b.selected && !b.isFolder) && 
                        !getAllBookmarksInFolder(child, bookmarks).filter(b => !b.isFolder).every(b => b.selected)
                      "
                      class="h-4 w-4 text-blue-600"
                    />
                  </div>
                  
                  <span class="font-medium">
                    📁 {{ child.title }}
                  </span>
                  <span class="ml-2 text-xs text-gray-500">
                    ({{ getAllBookmarksInFolder(child, bookmarks).filter(b => !b.isFolder).length }})
                  </span>
                </div>
                
                <!-- サブフォルダ内のアイテム（再帰的に表示） -->
                <div v-if="child.expanded" class="pl-6">
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

const props = defineProps<{
  bookmarks: ExtendedBookmark[]
}>()

const emit = defineEmits<{
  (e: 'update-title', id: string, newTitle: string): void
  (e: 'toggle-select', bookmark: ExtendedBookmark): void
  (e: 'toggle-folder-expanded', folder: ExtendedBookmark): void
  (e: 'toggle-folder-selection', folder: ExtendedBookmark): void
}>()

/**
 * フォルダの展開状態を切り替える
 */
const toggleFolderExpanded = (folder: ExtendedBookmark) => {
  emit('toggle-folder-expanded', folder)
}

/**
 * フォルダ内のブックマークの選択状態を切り替える
 */
const toggleFolderSelection = (folder: ExtendedBookmark) => {
  emit('toggle-folder-selection', folder)
}
</script>