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
      type="text"
      v-model="editingValue"
      class="bg-transparent focus:outline-none w-full text-xs"
      @keydown.enter="saveEdit"
      @keydown.esc="cancelEdit"
      @blur="saveEdit"
      @click.stop
    />
    <span v-else>{{ displayTag }}</span>
    <button 
      v-if="showEditButton && !isEditing" 
      class="ml-1 text-gray-500 hover:text-gray-700" 
      @click.stop="startEditing"
      title="Edit tag"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
      </svg>
    </button>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { removeTagPrefix, addTagPrefix } from '../utils/tagUtils'

const props = defineProps<{
  tag: string
  selected?: boolean
  showEditButton?: boolean
}>()

const emits = defineEmits<{
  (e: 'toggle'): void
  (e: 'edit', oldTag: string, newTag: string): void
}>()

// 編集モード関連の状態
const isEditing = ref(false)
const editingValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

// @マークを削除して表示する
const displayTag = computed(() => {
  return removeTagPrefix(props.tag)
})

// 編集モードを開始
const startEditing = () => {
  isEditing.value = true
  editingValue.value = displayTag.value
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// 編集をキャンセル
const cancelEdit = () => {
  isEditing.value = false
}

// 編集内容を保存
const saveEdit = () => {
  if (isEditing.value) {
    const newValue = editingValue.value.trim()
    if (newValue && newValue !== displayTag.value) {
      // @を追加
      const formattedNewTag = addTagPrefix(newValue)
      emits('edit', props.tag, formattedNewTag)
    }
    isEditing.value = false
  }
}
</script>