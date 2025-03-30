<template>
  <li class="border-b last:border-b-0 py-3">
    <div class="flex items-start">
      <!-- 選択チェックボックス -->
      <div v-if="selectable" class="mr-3 mt-1">
        <input 
          type="checkbox" 
          :checked="selected" 
          @change="$emit('toggle-select')"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>
      
      <div class="flex-1 min-w-0">
        <!-- 編集モード -->
        <div v-if="isEditing" class="flex items-center gap-2 mb-1">
          <input 
            v-model="editTitle" 
            class="flex-1 px-2 py-1 border rounded text-sm"
            @keyup.enter="saveEdit"
            ref="titleInput"
          />
          <button 
            @click="saveEdit" 
            class="px-2 py-1 text-xs bg-blue-500 text-white rounded"
          >
            保存
          </button>
          <button 
            @click="cancelEdit" 
            class="px-2 py-1 text-xs bg-gray-300 rounded"
          >
            キャンセル
          </button>
        </div>
        
        <!-- 表示モード -->
        <div v-else class="flex items-start">
          <div class="flex-1">
            <div class="flex justify-between items-center">
              <!-- タイトルとタグを左に配置 -->
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-medium">
                  {{ displayTitle }}
                </h3>
                
                <!-- タグ -->
                <div class="flex flex-wrap gap-1">
                  <TagBadge
                    v-for="tag in bookmarkTags"
                    :key="tag"
                    :tag="tag"
                    size="small"
                  />
                  <TagAddButton 
                    :current-tags="bookmarkTags"
                    @add-tag="addNewTag"
                  />
                </div>
              </div>

              <!-- 編集ボタンを右に配置 -->
              <button 
                @click="startEdit" 
                class="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 ml-2 shrink-0"
                title="編集"
              >
                <EditIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import TagBadge from './TagBadge.vue'
import TagAddButton from './TagAddButton.vue'
import EditIcon from './EditIcon.vue'
import { extractTags } from '../utils/tagUtils'

/**
 * ブックマークアイテムのプロパティ定義
 */
interface BookmarkProps {
  /** ブックマーク情報 */
  bookmark: {
    id: string
    title: string
    url?: string
  }
  /** 選択可能かどうか */
  selectable?: boolean
  /** 選択状態 */
  selected?: boolean
}

const props = withDefaults(defineProps<BookmarkProps>(), {
  selectable: false,
  selected: false
})

/** 親コンポーネントに通知するイベント */
const emit = defineEmits<{
  /** ブックマークタイトル更新イベント */
  (e: 'update-title', newTitle: string): void
  /** ブックマーク選択状態変更イベント */
  (e: 'toggle-select'): void
}>()

/** 編集モードかどうかのフラグ */
const isEditing = ref(false)
/** 編集中のタイトル */
const editTitle = ref('')
/** タイトル入力フィールドへの参照 */
const titleInput = ref<HTMLInputElement | null>(null)

/** 
 * タイトルからタグを除外した表示用タイトル
 */
const displayTitle = computed(() => {
  // タグを除外したタイトルを返す処理
  const title = props.bookmark.title
  return title.replace(/@\S+/g, '').trim()
})

/** 
 * ブックマークに含まれるタグの配列
 */
const bookmarkTags = computed(() => {
  return extractTags(props.bookmark.title)
})

/**
 * 編集モードを開始する
 * @returns {void}
 */
const startEdit = (): void => {
  editTitle.value = props.bookmark.title
  isEditing.value = true
  
  // 入力フォームにフォーカス
  nextTick(() => {
    titleInput.value?.focus()
  })
}

/**
 * 編集をキャンセルする
 * @returns {void}
 */
const cancelEdit = (): void => {
  isEditing.value = false
  editTitle.value = ''
}

/**
 * 編集内容を保存する
 * @returns {void}
 */
const saveEdit = (): void => {
  const newTitle = editTitle.value.trim()
  if (newTitle && newTitle !== props.bookmark.title) {
    emit('update-title', newTitle)
  }
  isEditing.value = false
}

/**
 * 新しいタグを追加する
 * @param {string} tag 追加するタグ
 * @returns {void}
 */
const addNewTag = (tag: string): void => {
  // 同じタグがすでにある場合は追加しない
  if (bookmarkTags.value.includes(tag)) {
    return
  }
  
  // 現在のタイトルにタグを追加して更新
  const newTitle = `${props.bookmark.title} ${tag}`
  emit('update-title', newTitle)
}
</script>