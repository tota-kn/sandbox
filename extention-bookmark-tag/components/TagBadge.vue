<template>
  <div 
    :class="[
      'px-2 py-1 rounded-full text-xs font-medium flex items-center',
      selected 
        ? 'bg-blue-100 text-blue-800 border border-blue-300'
        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
    ]"
    @click="$emit('toggle')"
  >
    {{ displayTag }}
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  tag: string
  selected?: boolean
}>()

defineEmits<{
  (e: 'toggle'): void
}>()

// @マークを削除して表示する
const displayTag = computed(() => {
  return props.tag.startsWith('@') ? props.tag.substring(1) : props.tag
})
</script>