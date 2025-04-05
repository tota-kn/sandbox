<template>
  <div v-if="bookmarks.length > 0">
    <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div class="flex justify-between items-center mb-2">
        <div class="text-sm text-gray-500">
          {{ bookmarks.length }} bookmarks selected
        </div>
        <button 
          class="text-sm text-blue-600 hover:text-blue-800" 
          @click="clearAllSelections"
        >
          Clear selections
        </button>
      </div>
      
      <ul class="space-y-2">
        <li 
          v-for="bookmark in bookmarks" 
          :key="bookmark.id"
          class="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
        >
          <div class="flex items-center flex-grow">
            <input 
              type="checkbox"                                               
              :checked="bookmark.selected" 
              class="mr-2"
              @change="handleToggleBookmark(bookmark)"
            >
            <p>
              {{ bookmark.title || bookmark.url }}
            </p>
          </div>
          <div class="flex flex-wrap gap-1 ml-2">
            <span 
              v-for="tag in extractTagsFromTitle(bookmark.title || '')" 
              :key="`${bookmark.id}-${tag}`"
              class="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded"
            >
              {{ tag }}
            </span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ExtendedBookmark } from '../utils/bookmarkUtils'
import { extractTags } from '../utils/tagUtils'

/** コンポーネントのプロパティ定義 */
defineProps<{
  /** 選択されたブックマークのリスト */
  bookmarks: ExtendedBookmark[]
}>()

/** コンポーネントのイベント定義 */
const emit = defineEmits<{
  /** ブックマークの選択状態が切り替わった時に発火 */
  'toggle-bookmark': [bookmark: ExtendedBookmark]
  /** 全選択クリアボタンがクリックされた時に発火 */
  'clear-selections': []
}>()

/**
 * タイトルからタグを抽出するユーティリティ関数
 * @param {string} title ブックマークのタイトル
 * @returns {string[]} タグのリスト
 */
const extractTagsFromTitle = (title: string): string[] => {
  return extractTags(title)
}

/**
 * ブックマークの選択状態を切り替える
 * @param {ExtendedBookmark} bookmark 対象のブックマーク
 */
const handleToggleBookmark = (bookmark: ExtendedBookmark): void => {
  emit('toggle-bookmark', bookmark)
}

/**
 * 全ての選択をクリアする
 */
const clearAllSelections = (): void => {
  emit('clear-selections')
}
</script>
