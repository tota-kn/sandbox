<template>
  <div class="mb-4 p-4 bg-accent rounded-md border border-blue-200">
    <h3 class="font-medium mb-2 text-tag-selected-text">
      Batch Tag Edit
    </h3>

    <div class="flex flex-col gap-3">
      <!-- タグ追加 -->
      <div class="flex items-center gap-2">
        <input
          v-model="tagToAdd"
          placeholder="Tag to add..."
          class="px-3 py-2 border rounded flex-grow"
        >
        <button
          :disabled="!tagToAdd || selectedCount === 0"
          class="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
          @click="addTag"
        >
          Add Tag
        </button>
      </div>

      <!-- タグ削除 -->
      <div class="flex items-center gap-2">
        <input
          v-model="tagToRemove"
          placeholder="Tag to remove..."
          class="px-3 py-2 border rounded flex-grow"
        >
        <button
          :disabled="!tagToRemove || selectedCount === 0"
          class="px-4 py-2 bg-destructive text-destructive-foreground rounded disabled:opacity-50"
          @click="removeTag"
        >
          Remove Tag
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

/**
 * バッチ編集フォームのプロパティ定義
 */
const props = defineProps<{
  /** 選択されているブックマークの数 */
  selectedCount: number
}>()

/**
 * 親コンポーネントに通知するイベント
 */
const emit = defineEmits<{
  /**
   * タグ追加イベント
   * @param tag 追加するタグ
   */
  (e: 'add-tag', tag: string): void
  /**
   * タグ削除イベント
   * @param tag 削除するタグ
   */
  (e: 'remove-tag', tag: string): void
}>()

/** 追加するタグの入力値 */
const tagToAdd = ref('')
/** 削除するタグの入力値 */
const tagToRemove = ref('')

/**
 * タグを追加する
 * @returns {void}
 */
const addTag = (): void => {
  if (!tagToAdd.value || props.selectedCount === 0) return
  emit('add-tag', tagToAdd.value)
  tagToAdd.value = ''
}

/**
 * タグを削除する
 * @returns {void}
 */
const removeTag = (): void => {
  if (!tagToRemove.value || props.selectedCount === 0) return
  emit('remove-tag', tagToRemove.value)
  tagToRemove.value = ''
}
</script>
