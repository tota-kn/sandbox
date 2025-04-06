<template>
  <li class="border-b last:border-b-0 py-2">
    <div class="flex items-center">
      <!-- 選択チェックボックス -->
      <div
        v-if="selectable"
        class="mr-3"
      >
        <input 
          type="checkbox" 
          :checked="selected" 
          class="h-4 w-4 text-primary focus:ring-primary-hover border-border rounded"
          @change="$emit('toggle-select')"
        >
      </div>
      
      <div class="flex-1 min-w-0">
        <!-- 編集モード -->
        <div
          v-if="isEditing"
          class="flex items-center gap-2 mb-1"
        >
          <input 
            ref="titleInput" 
            v-model="editTitle"
            class="flex-1 px-2 py-1 border rounded text-sm"
            @keyup.enter="saveEdit"
          >
          <button 
            class="px-2 py-1 text-xs bg-primary text-primary-foreground rounded" 
            @click="saveEdit"
          >
            保存
          </button>
          <button 
            class="px-2 py-1 text-xs bg-secondary hover:bg-secondary-hover rounded" 
            @click="cancelEdit"
          >
            キャンセル
          </button>
        </div>
        
        <!-- 表示モード -->
        <div
          v-else
          class="flex items-center"
        >
          <div class="flex-1">
            <div class="flex justify-between items-center">
              <!-- タイトルとタグを左に配置 -->
              <div class="flex items-center gap-1 flex-wrap">
                <h3 class="text-sm font-medium">
                  <a 
                    :href="bookmark.url" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="text-primary hover:text-primary-hover hover:underline"
                  >
                    {{ displayTitle }}
                  </a>
                </h3>
                
                <!-- タグ -->
                <div class="flex flex-wrap gap-1">
                  <TagBadge
                    v-for="tag in bookmarkTags"
                    :key="tag"
                    :tag="tag"
                    size="small"
                  >
                    <IconButton
                      class="ml-1" 
                      title="Remove tag"
                      @click.stop="removeTag(tag)"
                    >
                      <XMarkIcon class="size-3" />
                    </IconButton>
                  </TagBadge>
                  <TagAddButton 
                    :current-tags="bookmarkTags"
                    @add-tag="addNewTag"
                  />
                </div>
              </div>

              <!-- 編集ボタンを右に配置 -->
              <IconButton
                size="sm"
                class="ml-2 shrink-0"
                title="編集"
                @click="startEdit"
              >
                <PencilSquareIcon class="size-4" />
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import TagBadge from './TagBadge.vue'
import TagAddButton from './TagAddButton.vue'
import IconButton from './IconButton.vue'
import { extractTags, removeTagFromTitle } from '../utils/tagUtils'
import { PencilSquareIcon, XMarkIcon } from '@heroicons/vue/24/outline'

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

/**
 * タグを削除する
 * @param {string} tag 削除するタグ
 * @returns {void}
 */
const removeTag = (tag: string): void => {
  // タグを削除して更新
  const newTitle = removeTagFromTitle(props.bookmark.title, tag)
  emit('update-title', newTitle)
}
</script>