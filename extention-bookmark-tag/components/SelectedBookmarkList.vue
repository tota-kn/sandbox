<template>
  <div
    v-if="bookmarks.length > 0"
    class="bg-gray-50 rounded-lg p-3 border border-gray-200"
  >
    <div
      class="flex justify-between items-center cursor-pointer"
      @click="toggleExpanded"
    >
      <div class="text-sm text-gray-500 flex items-center">
        <span class="mr-2">
          {{ expanded ? '▼' : '▶' }}
        </span>
        <span>{{ bookmarks.length }} bookmarks selected</span>
      </div>
      <div class="flex space-x-2">
        <button 
          class="text-sm text-blue-600 hover:text-blue-800" 
          @click.stop="toggleAddTagForm"
        >
          Add tag
        </button>
        <button 
          class="text-sm text-red-600 hover:text-red-800" 
          @click.stop="toggleRemoveTagForm"
        >
          Remove tag
        </button>
        <button 
          class="text-sm text-gray-600 hover:text-gray-800" 
          @click.stop="clearAllSelections"
        >
          Clear selections
        </button>
      </div>
    </div>
    
    <!-- タグ追加フォーム (インライン) -->
    <div 
      v-if="showAddTagForm" 
      class="mt-2 p-2 bg-white rounded border border-gray-200"
    >
      <div class="flex items-center">
        <input 
          ref="addTagInput"
          v-model="tagInput"
          type="text"
          class="flex-grow p-1 border rounded mr-2"
          placeholder="Enter tag name (without @)"
          @keyup.enter="handleAddTag"
        >
        <button 
          class="px-3 py-1 bg-blue-500 text-white rounded"
          @click="handleAddTag"
        >
          Add
        </button>
        <button 
          class="ml-2 px-3 py-1 bg-gray-200 rounded"
          @click="cancelTagForm"
        >
          Cancel
        </button>
      </div>
    </div>
    
    <!-- タグ削除フォーム (インライン) -->
    <div 
      v-if="showRemoveTagForm" 
      class="mt-2 p-2 bg-white rounded border border-gray-200"
    >
      <div class="flex flex-wrap gap-2 mb-2">
        <button
          v-for="tag in allTagsInSelectedBookmarks"
          :key="tag"
          class="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          @click="handleRemoveTag(tag)"
        >
          {{ tag }} ×
        </button>
      </div>
      <div class="flex justify-end">
        <button 
          class="px-3 py-1 bg-gray-200 rounded"
          @click="cancelTagForm"
        >
          Close
        </button>
      </div>
    </div>

    <ul
      v-if="expanded"
      class="space-y-2 mt-2"
    >
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
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { ExtendedBookmark } from '../utils/bookmarkUtils'
import { extractTags } from '../utils/tagUtils'

/** コンポーネントのプロパーネントのプロパティ定義 */
const props = defineProps<{
  /** 選択されたブックマークのリスト */
  bookmarks: ExtendedBookmark[]
}>()

/** コンポーネントのイベント定義 */
const emit = defineEmits<{
  /** ブックマークの選択状態が切り替わった時に発火 */
  'toggle-bookmark': [bookmark: ExtendedBookmark]
  /** 全選択クリアボタンがクリックされた時に発火 */
  'clear-selections': []
  /** 選択されたブックマークにタグを追加 */
  'add-tag': [tag: string]
  /** 選択されたブックマークからタグを削除 */
  'remove-tag': [tag: string]
}>()

/** 開閉状態を管理する変数（デフォルトは閉じている） */
const expanded = ref(false)
/** タグ追加フォームの表示状態 */
const showAddTagForm = ref(false)
/** タグ削除フォームの表示状態 */
const showRemoveTagForm = ref(false)
/** タグ入力値 */
const tagInput = ref('')
/** タグ入力フィールドへの参照 */
const addTagInput = ref<HTMLInputElement | null>(null)

/**
 * タイトルからタグを抽出するユーティリティ関数
 * @param {string} title ブックマークのタイトル
 * @returns {string[]} タグのリスト
 */
const extractTagsFromTitle = (title: string): string[] => {
  return extractTags(title)
}

/**
 * 選択したブックマークに含まれるすべてのユニークなタグを計算
 */
const allTagsInSelectedBookmarks = computed((): string[] => {
  const allTags = props.bookmarks
    .flatMap(bookmark => extractTags(bookmark.title || ''))
  
  // 重複を削除
  return [...new Set(allTags)]
})

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

/**
 * 開閉状態を切り替える
 */
const toggleExpanded = (): void => {
  expanded.value = !expanded.value
}

/**
 * タグ追加フォームの表示/非表示を切り替える
 */
const toggleAddTagForm = (): void => {
  // フォームを表示する場合、削除フォームは閉じる
  if (!showAddTagForm.value) {
    showRemoveTagForm.value = false
    showAddTagForm.value = true
    // 入力フィールドにフォーカスを当てる（次のティックで実行）
    nextTick(() => {
      addTagInput.value?.focus()
    })
  } else {
    showAddTagForm.value = false
  }
  event?.stopPropagation()
}

/**
 * タグ削除フォームの表示/非表示を切り替える
 */
const toggleRemoveTagForm = (): void => {
  // フォームを表示する場合、追加フォームは閉じる
  if (!showRemoveTagForm.value) {
    showAddTagForm.value = false
    showRemoveTagForm.value = true
  } else {
    showRemoveTagForm.value = false
  }
  event?.stopPropagation()
}

/**
 * タグフォームをキャンセル・クリアする
 */
const cancelTagForm = (): void => {
  showAddTagForm.value = false
  showRemoveTagForm.value = false
  tagInput.value = ''
  event?.stopPropagation()
}

/**
 * 複数ブックマークへのタグ追加を実行
 */
const handleAddTag = (): void => {
  if (!tagInput.value.trim()) return

  // @マークを自動的に付与せずにタグ名をそのまま渡す
  // （親コンポーネント側で@付与するか判断）
  emit('add-tag', tagInput.value.trim())
  
  // フォームを閉じて入力をクリア
  cancelTagForm()
}

/**
 * 複数ブックマークからタグ削除を実行
 * @param {string} tag 削除するタグ
 */
const handleRemoveTag = (tag: string): void => {
  if (!tag) return
  
  emit('remove-tag', tag)
  
  // 削除後も削除フォームを表示したままにする
  // ユーザーが複数のタグを削除できるようにするため
}
</script>
