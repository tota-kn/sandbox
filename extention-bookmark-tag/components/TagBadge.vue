<template>
  <div 
    :class="[
      'px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1',
      selected 
        ? 'bg-blue-100 text-blue-800 border border-blue-300'
        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
    ]"
    @click="$emit('toggle')"
  >
    <input
      v-if="isEditing && showEditButton"
      ref="inputRef"
      v-model="editingValue"
      type="text"
      class="bg-transparent focus:outline-none w-full text-xs"
      @keydown.enter="saveEdit"
      @keydown.esc="cancelEdit"
      @blur="cancelEdit"
      @click.stop
    >
    <span v-else>{{ displayTag }}</span>
    <button 
      v-if="showEditButton && !isEditing" 
      class="ml-1 text-gray-500 hover:text-gray-700" 
      title="Edit tag"
      @click.stop="startEditing"
    >
      <EditIcon size="small" />
    </button>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { removeTagPrefix, addTagPrefix } from '../utils/tagUtils'
import EditIcon from './EditIcon.vue'

/** 
 * コンポーネントのプロパティ定義
 */
const props = defineProps<{
  /** 表示するタグ文字列 */
  tag: string
  /** タグが選択状態かどうか */
  selected?: boolean
  /** 編集ボタンを表示するかどうか */
  showEditButton?: boolean
}>()

/**
 * 親コンポーネントに通知するイベント
 */
const emit = defineEmits<{
  /**
   * タグ選択切り替えイベント
   */
  (e: 'toggle'): void,
  /**
   * タグ編集イベント
   * @param oldTag 元のタグ名
   * @param newTag 新しいタグ名
   */
  (e: 'edit', oldTag: string, newTag: string): void
}>()

/** 編集モードかどうかのフラグ */
const isEditing = ref(false)
/** 編集中のタグ文字列 */
const editingValue = ref('')
/** 入力フィールドへの参照 */
const inputRef = ref<HTMLInputElement | null>(null)

/** 
 * @マークを削除した表示用のタグ文字列
 */
const displayTag = computed(() => {
  return removeTagPrefix(props.tag)
})

/**
 * 編集モードを開始する
 * @returns {void}
 */
const startEditing = (): void => {
  isEditing.value = true
  editingValue.value = displayTag.value
  nextTick(() => {
    inputRef.value?.focus()
  })
}

/**
 * 編集をキャンセルする
 * @returns {void}
 */
const cancelEdit = (): void => {
  isEditing.value = false
}

/**
 * 編集内容を保存する
 * @returns {void}
 */
const saveEdit = (): void => {
  if (isEditing.value) {
    const newValue = editingValue.value.trim()
    if (newValue && newValue !== displayTag.value) {
      // @を追加
      const formattedNewTag = addTagPrefix(newValue)
      emit('edit', props.tag, formattedNewTag)
    }
    isEditing.value = false
  }
}
</script>