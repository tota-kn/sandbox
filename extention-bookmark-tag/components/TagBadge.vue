<template>
  <div
    :class="[
      'px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1',
      selected
        ? 'bg-tag-selected-bg text-tag-selected-text border border-tag-selected-border'
        : 'bg-tag-default-bg text-tag-default-text border border-tag-default-border hover:bg-gray-200'
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
    <IconButton
      v-if="showEditButton && !isEditing"
      size="sm"
      class="ml-1"
      title="Edit tag"
      @click.stop="startEditing"
    >
      <PencilSquareIcon class="size-4" />
    </IconButton>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { removeTagPrefix, addTagPrefix } from '../utils/tagUtils'
import { PencilSquareIcon } from '@heroicons/vue/24/outline'
import IconButton from './IconButton.vue'

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
  (e: 'toggle'): void
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
