<template>
  <div class="mb-4 p-4 bg-blue-50 rounded-md border border-blue-200">
    <h3 class="font-medium mb-2 text-blue-800">Batch Tag Edit</h3>
    
    <div class="flex flex-col gap-3">
      <!-- タグ追加 -->
      <div class="flex items-center gap-2">
        <input 
          v-model="tagToAdd" 
          placeholder="Tag to add..." 
          class="px-3 py-2 border rounded flex-grow"
        />
        <button 
          @click="addTag"
          :disabled="!tagToAdd || selectedCount === 0"
          class="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
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
        />
        <button 
          @click="removeTag"
          :disabled="!tagToRemove || selectedCount === 0"
          class="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
        >
          Remove Tag
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  selectedCount: number
}>()

const emit = defineEmits<{
  (e: 'add-tag', tag: string): void
  (e: 'remove-tag', tag: string): void
}>()

const tagToAdd = ref('')
const tagToRemove = ref('')

/**
 * タグを追加する
 */
const addTag = () => {
  if (!tagToAdd.value || props.selectedCount === 0) return
  emit('add-tag', tagToAdd.value)
  tagToAdd.value = ''
}

/**
 * タグを削除する
 */
const removeTag = () => {
  if (!tagToRemove.value || props.selectedCount === 0) return
  emit('remove-tag', tagToRemove.value)
  tagToRemove.value = ''
}
</script>